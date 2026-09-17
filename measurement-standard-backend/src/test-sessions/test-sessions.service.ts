// import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { DataSource, Repository } from 'typeorm';
// import { CreateTestSessionDto } from './dto/create-test-session.dto';
// import { TestSession } from './entities/test-session.entity';
// import { Question } from '../questions/entities/question.entity';
// import { UserResponse } from '../user-responses/entities/user-response.entity';
// import { UserProgress } from '../user-progress/entities/user-progress.entity';

// @Injectable()
// export class TestSessionsService {
//   constructor(
//     @InjectRepository(TestSession)
//     private readonly testSessionRepository: Repository<TestSession>,
//     @InjectRepository(Question)
//     private readonly questionRepository: Repository<Question>,
//     private readonly dataSource: DataSource,
//   ) {}

//   // إنشاء اختبار مع تصحيح كامل يتم على الخادم
//   async create(userId: string, createDto: CreateTestSessionDto) {
//     // جلب أسئلة نوع الاختبار مع خياراتها
//     const questions = await this.questionRepository.find({
//       where: { section: { examType: { id: createDto.examTypeId } } },
//       relations: { choices: true },
//     });

//     if (questions.length === 0) {
//       throw new NotFoundException('لا توجد أسئلة لنوع الاختبار هذا');
//     }

//     const questionMap = new Map(questions.map((q) => [q.id, q]));
//     const answeredQuestions = new Set<string>();
//     const responseRows: {
//       questionId: string;
//       selectedChoiceId: string;
//       is_correct: boolean;
//     }[] = [];

//     let score = 0;
//     const answers = createDto.answers;

//     for (const ans of answers) {
//       if (answeredQuestions.has(ans.questionId)) {
//         throw new BadRequestException('لا يمكن الإجابة على نفس السؤال مرتين');
//       }
//       answeredQuestions.add(ans.questionId);

//       const question = questionMap.get(ans.questionId);
//       if (!question) {
//         throw new BadRequestException('أحد الأسئلة غير موجود في هذا الاختبار');
//       }

//       const choice = question.choices.find((c) => c.id === ans.selectedChoiceId);
//       if (!choice) {
//         throw new BadRequestException('أحد الخيارات المختارة غير صالح');
//       }

//       if (choice.is_correct) score += 1;
//       responseRows.push({
//         questionId: question.id,
//         selectedChoiceId: choice.id,
//         is_correct: choice.is_correct,
//       });
//     }

//     const total_questions = answers.length;
//     const score_pct = Math.round((score / total_questions) * 100);

//     // حفظ الجلسة والإجابات وتحديث التقدم داخل معاملة واحدة
//     const session = await this.dataSource.transaction(async (manager) => {
//       const savedSession = await manager.save(
//         manager.create(TestSession, {
//           user: { id: userId },
//           examType: { id: createDto.examTypeId },
//           score,
//           total_questions,
//         }),
//       );

//       await manager.save(
//         UserResponse,
//         responseRows.map((r) =>
//           manager.create(UserResponse, {
//             user: { id: userId },
//             question: { id: r.questionId },
//             selectedChoice: { id: r.selectedChoiceId },
//             is_correct: r.is_correct,
//             session: { id: savedSession.id },
//           }),
//         ),
//       );

//       // تحديث تقدم المستخدم
//       let progress = await manager.findOne(UserProgress, {
//         where: { user: { id: userId } },
//       });
//       if (!progress) {
//         progress = manager.create(UserProgress, {
//           user: { id: userId },
//           overall_score: 0,
//           tests_completed: 0,
//           last_active_date: new Date(),
//         });
//       }

//       const prevTests = progress.tests_completed || 0;
//       const prevOverall = Number(progress.overall_score || 0);
//       const newOverall = Math.round(((prevOverall * prevTests + score_pct) / (prevTests + 1)) * 100) / 100;

//       progress.overall_score = newOverall;
//       progress.tests_completed = prevTests + 1;
//       progress.last_active_date = new Date();
//       await manager.save(UserProgress, progress);

//       return savedSession;
//     });

//     const saved = await this.testSessionRepository.findOne({
//       where: { id: session.id },
//       relations: { examType: true },
//     });

//     return {
//       ...saved,
//       score_pct,
//       correct_count: score,
//     };
//   }

//   async findAllForUser(userId: string) {
//     return await this.testSessionRepository.find({
//       where: { user: { id: userId } },
//       relations: { examType: true },
//       order: { created_at: 'DESC' }, // عرض الاختبارات الأحدث أولاً
//     });
//   }
// }







import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  In,
  Repository,
} from 'typeorm';

import { CreateTestSessionDto } from './dto/create-test-session.dto';
import { TestSession } from './entities/test-session.entity';

import { Question } from '../questions/entities/question.entity';
import { Choice } from '../choices/entities/choice.entity';

import { UserResponse } from '../user-responses/entities/user-response.entity';
import { UserProgress } from '../user-progress/entities/user-progress.entity';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class TestSessionsService {
  constructor(
    @InjectRepository(TestSession)
    private readonly testSessionRepository: Repository<TestSession>,

    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,

    private readonly dataSource: DataSource,

    private readonly notificationsService: NotificationsService,
  ) {}

  // ============================================================
  // CREATE TEST SESSION
  // ============================================================

  async create(
    userId: string,
    email:string,
    createDto: CreateTestSessionDto,
  ) {
    // ----------------------------------------------------------
    // 1. Get all questions for this exam type
    // ----------------------------------------------------------









    const questions = await this.questionRepository.find({
      where: {
        section: {
          examType: {
            id: createDto.examTypeId,
          },
        },
      },
      relations: {
        choices: true,
      },
    });

    if (questions.length === 0) {
      throw new NotFoundException(
        'لا توجد أسئلة لنوع الاختبار هذا',
      );
    }

    // ----------------------------------------------------------
    // 2. Create a Map for quick question lookup
    // ----------------------------------------------------------

    const questionMap = new Map(
      questions.map((question) => [
        question.id,
        question,
      ]),
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
        throw new BadRequestException(
          'لا يمكن الإجابة على نفس السؤال مرتين',
        );
      }

      answeredQuestions.add(answer.questionId);

      // Find question
      const question = questionMap.get(
        answer.questionId,
      );

      if (!question) {
        throw new BadRequestException(
          'أحد الأسئلة غير موجود في هذا الاختبار',
        );
      }

      // Find selected choice
      const choice = question.choices.find(
        (c) => c.id === answer.selectedChoiceId,
      );

      if (!choice) {
        throw new BadRequestException(
          'أحد الخيارات المختارة غير صالح',
        );
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
      throw new BadRequestException(
        'يجب الإجابة على سؤال واحد على الأقل',
      );
    }

    // ----------------------------------------------------------
    // 8. Calculate percentage
    // ----------------------------------------------------------

    const score_pct = Math.round(
      (score / total_questions) * 100,
    );

    // ==========================================================
    // 9. Transaction
    // ==========================================================

    const session = await this.dataSource.transaction(
      async (manager) => {
        // ------------------------------------------------------
        // 9.1 Create TestSession
        // ------------------------------------------------------

        const savedSession = await manager.save(
          manager.create(TestSession, {
            user: {
              id: userId,
            },

            examType: {
              id: createDto.examTypeId,
            },

            score,

            total_questions,
          }),
        );

        // ------------------------------------------------------
        // 9.2 Get question IDs
        // ------------------------------------------------------

        const questionIds = responseRows.map(
          (row) => row.questionId,
        );

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

        const existingResponses =
          await manager.find(UserResponse, {
            where: {
              user: {
                id: userId,
              },

              question: {
                id: In(questionIds),
              },
            },

            relations: {
              question: true,
            },
          });

        // ------------------------------------------------------
        // 9.4 Convert existing responses to Map
        //
        // questionId -> UserResponse
        // ------------------------------------------------------

        const existingResponseMap =
          new Map<string, UserResponse>();

        for (const response of existingResponses) {
          existingResponseMap.set(
            response.question.id,
            response,
          );
        }

        // ------------------------------------------------------
        // 9.5 Prepare new and existing responses
        // ------------------------------------------------------

        const newResponses: UserResponse[] = [];

        const responsesToUpdate: UserResponse[] = [];

        // ------------------------------------------------------
        // 9.6 Process every answer
        // ------------------------------------------------------

        for (const row of responseRows) {
          const existingResponse =
            existingResponseMap.get(
              row.questionId,
            );

          // ====================================================
          // CASE 1:
          // User has NEVER answered this question
          // ====================================================

          if (!existingResponse) {

            const newResponse =
              manager.create(UserResponse, {
                user: {
                  id: userId,
                },

                question: {
                  id: row.questionId,
                },

                selectedChoice: {
                  id: row.selectedChoiceId,
                },

                is_correct:
                  row.is_correct,

                session: {
                  id: savedSession.id,
                },
              });

            newResponses.push(newResponse);

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

          existingResponse.selectedChoice =
            manager.create(Choice, {
              id: row.selectedChoiceId,
            });

          // if(existingResponse.is_correct === true &&  row.is_correct === false){
          //     throw new BadRequestException('لا يمكنك تغيير إجابة سؤال صحيحة إلى إجابة خاطئة')
          // }

          existingResponse.is_correct =
            row.is_correct;

          existingResponse.session =
            manager.create(TestSession, {
              id: savedSession.id,
            });

          responsesToUpdate.push(
            existingResponse,
          );
        }

        // ------------------------------------------------------
        // 9.7 Insert new responses
        // ------------------------------------------------------

        if (newResponses.length > 0) {
          await manager.save(
            UserResponse,
            newResponses,
          );
        }

        // ------------------------------------------------------
        // 9.8 Update existing responses
        // ------------------------------------------------------

        if (responsesToUpdate.length > 0) {
          await manager.save(
            UserResponse,
            responsesToUpdate,
          );
        }

        // ======================================================
        // 10. Update user progress
        // ======================================================

        let progress =
          await manager.findOne(UserProgress, {
            where: {
              user: {
                id: userId,
              },
            },
          });

        // ------------------------------------------------------
        // 10.1 Create progress if it doesn't exist
        // ------------------------------------------------------

        if (!progress) {
          progress = manager.create(
            UserProgress,
            {
              user: {
                id: userId,
              },

              overall_score: 0,

              tests_completed: 0,

              last_active_date:
                new Date(),
            },
          );
        }

        // ------------------------------------------------------
        // 10.2 Previous statistics
        // ------------------------------------------------------

        const prevTests =
          progress.tests_completed || 0;

        const prevOverall =
          Number(
            progress.overall_score || 0,
          );

        // ------------------------------------------------------
        // 10.3 Calculate new average score
        // ------------------------------------------------------

        const newOverall =
          Math.round(
            (
              (
                prevOverall * prevTests +
                score_pct
              ) /
              (prevTests + 1)
            ) * 100,
          ) / 100;

        // ------------------------------------------------------
        // 10.4 Update progress
        // ------------------------------------------------------

        progress.overall_score =
          newOverall;

        progress.tests_completed =
          prevTests + 1;

        progress.last_active_date =
          new Date();

        // ------------------------------------------------------
        // 10.5 Save progress
        // ------------------------------------------------------

        await manager.save(
          UserProgress,
          progress,
        );

        // ------------------------------------------------------
        // 10.6 Return created session
        // ------------------------------------------------------

        return savedSession;
      },
    );



    await this.notificationsService.create(
      {
          user_email:email,
          title: 'تم إنهاء الاختبار',
          message: 'تم حفظ نتيجة اختبارك بنجاح', 
          type: 'TEST_RESULT',
          url: `/test/results/${session.id}`,
          data: {
            testSessionId: session.id,
          },
        },
      );


    // ==========================================================
    // 11. Get saved session with exam type
    // ==========================================================

    const saved =
      await this.testSessionRepository.findOne({
        where: {
          id: session.id,
        },

        relations: {
          examType: true,
        },
      });

    // ==========================================================
    // 12. Return result
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
    return await this.testSessionRepository.find({
      where: {
        user: {
          id: userId,
        },
      },

      relations: {
        examType: true,
      },

      order: {
        created_at: 'DESC',
      },
    });
  }
}