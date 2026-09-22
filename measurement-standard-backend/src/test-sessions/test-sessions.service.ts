import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateTestSessionDto } from './dto/create-test-session.dto';

import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ============================================================
  // CREATE TEST SESSION
  // ============================================================

  async create(userId: string, email: string, createDto: CreateTestSessionDto) {
    // ----------------------------------------------------------
    // 1. Get all questions for this exam type
    // ----------------------------------------------------------

    const questions = await this.prisma.question.findMany({
      where: {
        section: {
          exam_type_id: createDto.examTypeId,
        },
      },
      include: {
        choices: true,
      },
    });

    if (questions.length === 0) {
      throw new NotFoundException('لا توجد أسئلة لنوع الاختبار هذا');
    }

    // ----------------------------------------------------------
    // 2. Create a Map for quick question lookup
    // ----------------------------------------------------------

    const questionMap = new Map(
      questions.map((question) => [question.id, question]),
    );

    // ----------------------------------------------------------
    // 3. Prevent answering the same question twice
    //    inside the same test
    // ----------------------------------------------------------

    const answeredQuestions = new Set<string>();

    // ----------------------------------------------------------
    // 4. Store validated answers here
    // ----------------------------------------------------------

    const responseRows: {
      questionId: string;
      selectedChoiceId: string;
      is_correct: boolean;
    }[] = [];

    // ----------------------------------------------------------
    // 5. Calculate score
    // ----------------------------------------------------------

    let score = 0;

    const answers = createDto.answers;

    // ----------------------------------------------------------
    // 6. Validate every answer
    // ----------------------------------------------------------

    for (const answer of answers) {
      // Prevent duplicate question in same test
      if (answeredQuestions.has(answer.questionId)) {
        throw new BadRequestException('لا يمكن الإجابة على نفس السؤال مرتين');
      }

      answeredQuestions.add(answer.questionId);

      // Find question
      const question = questionMap.get(answer.questionId);

      if (!question) {
        throw new BadRequestException('أحد الأسئلة غير موجود في هذا الاختبار');
      }

      // Find selected choice
      const choice = question.choices.find(
        (c) => c.id === answer.selectedChoiceId,
      );

      if (!choice) {
        throw new BadRequestException('أحد الخيارات المختارة غير صالح');
      }

      // Calculate score
      if (choice.is_correct) {
        score += 1;
      }

      // Store validated answer
      responseRows.push({
        questionId: question.id,
        selectedChoiceId: choice.id,
        is_correct: choice.is_correct,
      });
    }

    // ----------------------------------------------------------
    // 7. Validate that at least one answer exists
    // ----------------------------------------------------------

    const total_questions = answers.length;

    if (total_questions === 0) {
      throw new BadRequestException('يجب الإجابة على سؤال واحد على الأقل');
    }

    // ----------------------------------------------------------
    // 8. Calculate percentage
    // ----------------------------------------------------------

    const score_pct = Math.round((score / total_questions) * 100);

    // ==========================================================
    // 9. Transaction
    // ==========================================================

    const session = await (async () => {
      // ------------------------------------------------------
      // 9.1 Create TestSession
      // ------------------------------------------------------

      const savedSession = await this.prisma.testSession.create({
        data: {
          user_id: userId,
          exam_type_id: createDto.examTypeId,
          score,
          total_questions,
        },
      });

      // ------------------------------------------------------
      // 9.2 Get question IDs
      // ------------------------------------------------------

      const questionIds = responseRows.map((row) => row.questionId);

      // ------------------------------------------------------
      // 9.3 Find existing responses for this user
      //
      // IMPORTANT:
      // We search by:
      //
      // user_id + question_id
      //
      // because our database allows only one response
      // for each user/question pair.
      // ------------------------------------------------------

      const existingResponses = await this.prisma.userResponse.findMany({
        where: {
          user_id: userId,
          question_id: { in: questionIds },
        },
      });

      // ------------------------------------------------------
      // 9.4 Convert existing responses to Map
      //
      // questionId -> UserResponse
      // ------------------------------------------------------

      const existingResponseMap = new Map<
        string,
        (typeof existingResponses)[number]
      >();

      for (const response of existingResponses) {
        existingResponseMap.set(response.question_id, response);
      }

      // ------------------------------------------------------
      // 9.5 Process every answer
      // ------------------------------------------------------

      for (const row of responseRows) {
        const existingResponse = existingResponseMap.get(row.questionId);

        // ====================================================
        // CASE 1:
        // User has NEVER answered this question
        // ====================================================

        if (!existingResponse) {
          await this.prisma.userResponse.create({
            data: {
              user_id: userId,
              question_id: row.questionId,
              selected_choice_id: row.selectedChoiceId,
              is_correct: row.is_correct,
              test_session_id: savedSession.id,
            },
          });

          continue;
        }

        // ====================================================
        // CASE 2:
        // User already answered this question
        //
        // DO NOT CREATE A NEW ROW.
        //
        // UPDATE THE EXISTING ROW.
        // ====================================================

        await this.prisma.userResponse.update({
          where: { id: existingResponse.id },
          data: {
            selected_choice_id: row.selectedChoiceId,
            is_correct: row.is_correct,
            test_session_id: savedSession.id,
          },
        });
      }

      // ======================================================
      // 10. Update user progress
      // ======================================================

      let progress = await this.prisma.userProgress.findFirst({
        where: { user_id: userId },
      });

      // ------------------------------------------------------
      // 10.1 Previous statistics
      // ------------------------------------------------------

      const prevTests = progress?.tests_completed || 0;
      const prevOverall = Number(progress?.overall_score || 0);

      const newOverall =
        Math.round(
          ((prevOverall * prevTests + score_pct) / (prevTests + 1)) * 100,
        ) / 100;

      // ------------------------------------------------------
      // 10.2 Create / update progress
      // ------------------------------------------------------

      if (progress) {
        progress = await this.prisma.userProgress.update({
          where: { id: progress.id },
          data: {
            overall_score: newOverall,
            tests_completed: prevTests + 1,
            last_active_date: new Date(),
          },
        });
      } else {
        progress = await this.prisma.userProgress.create({
          data: {
            user_id: userId,
            overall_score: newOverall,
            tests_completed: 1,
            last_active_date: new Date(),
          },
        });
      }

      // ------------------------------------------------------
      // 10.3 Return created session
      // ------------------------------------------------------

      return savedSession;
    })();

    // ==========================================================
    // 11. Send notification
    // ==========================================================

    await this.notificationsService.create({
      user_email: email,
      title: 'تم إنهاء الاختبار',
      message: 'تم حفظ نتيجة اختبارك بنجاح',
      type: 'TEST_RESULT',
      url: `/test/results/${session.id}`,
      data: {
        testSessionId: session.id,
      },
    });

    // ==========================================================
    // 12. Get saved session with exam type
    // ==========================================================

    const saved = await this.prisma.testSession.findUnique({
      where: {
        id: session.id,
      },
      include: {
        examType: true,
      },
    });

    // ==========================================================
    // 13. Return result
    // ==========================================================

    return {
      ...saved,

      score_pct,

      correct_count: score,
    };
  }

  // ============================================================
  // GET ALL TESTS FOR USER
  // ============================================================

  async findAllForUser(userId: string) {
    return await this.prisma.testSession.findMany({
      where: {
        user_id: userId,
      },
      include: {
        examType: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
