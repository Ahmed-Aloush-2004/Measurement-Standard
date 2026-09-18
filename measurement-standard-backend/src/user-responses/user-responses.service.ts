import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateUserResponseDto } from './dto/create-user-response.dto';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserResponsesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly responseInclude = {
    user: true,
    question: true,
    selectedChoice: true,
    session: true,
  } as const;

  // ============================================================
  // CREATE / UPDATE USER RESPONSE
  // ============================================================

  async create(userId: string, createDto: CreateUserResponseDto) {
    // ----------------------------------------------------------
    // 1. Find selected choice
    // ----------------------------------------------------------

    const choice = await this.prisma.choice.findUnique({
      where: { id: createDto.selectedChoiceId },
      include: { question: true },
    });

    // ----------------------------------------------------------
    // 2. Make sure choice exists
    // ----------------------------------------------------------

    if (!choice) {
      throw new NotFoundException('الخيار غير موجود');
    }

    // ----------------------------------------------------------
    // 3. Make sure choice belongs to the question
    // ----------------------------------------------------------

    if (choice.question_id !== createDto.questionId) {
      throw new BadRequestException('الخيار المختار لا ينتمي إلى هذا السؤال');
    }

    // ----------------------------------------------------------
    // 4. Find existing response
    //
    // IMPORTANT:
    //
    // We search by:
    //
    // user + question
    //
    // because there must be only ONE response
    // for this combination.
    // ----------------------------------------------------------

    const existingResponse = await this.prisma.userResponse.findFirst({
      where: {
        user_id: userId,
        question_id: createDto.questionId,
      },
    });

    // ==========================================================
    // CASE 1:
    // Existing response found
    // ==========================================================

    if (existingResponse) {
      // --------------------------------------------------------
      // Update correctness
      //
      // Wrong -> Wrong
      // Wrong -> Correct
      // Correct -> Correct
      // Correct -> Wrong
      //
      // Everything is handled by the same row.
      // --------------------------------------------------------
      if (existingResponse.is_correct === true && choice.is_correct === false) {
        throw new BadRequestException(
          'لا يمكنك تغيير إجابة سؤال صحيحة إلى إجابة خاطئة',
        );
      }

      await this.prisma.userResponse.update({
        where: { id: existingResponse.id },
        data: {
          selected_choice_id: choice.id,
          is_correct: choice.is_correct,
        },
      });

      return this.prisma.userResponse.findUnique({
        where: { id: existingResponse.id },
        include: this.responseInclude,
      });
    }

    // ==========================================================
    // CASE 2:
    // No previous response
    // ==========================================================

    const response = await this.prisma.userResponse.create({
      data: {
        user_id: userId,
        question_id: createDto.questionId,
        selected_choice_id: choice.id,
        is_correct: choice.is_correct,
      },
      include: this.responseInclude,
    });

    return response;
  }

  // ============================================================
  // GET ALL RESPONSES FOR USER
  // ============================================================

  async findAllForUser(userId: string) {
    return await this.prisma.userResponse.findMany({
      where: {
        user_id: userId,
      },
      include: {
        question: true,
        selectedChoice: true,
        session: true,
      },
      orderBy: {
        answered_at: 'desc',
      },
    });
  }

  // ============================================================
  // GET USER MISTAKES
  // ============================================================

  async getMistakesForUser(userId: string) {
    return await this.prisma.userResponse.findMany({
      where: {
        user_id: userId,
        is_correct: false,
      },
      include: {
        question: {
          include: {
            choices: true,
          },
        },
        selectedChoice: true,
        session: true,
      },
      orderBy: {
        answered_at: 'desc',
      },
    });
  }
}
