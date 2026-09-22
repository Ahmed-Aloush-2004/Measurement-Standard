import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Question, Section, ExamType, Choice } from '@prisma/client';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionFilterQueryDto } from './dto/question-filter.query.dto';
import { PrismaService } from '../prisma/prisma.service';

type QuestionWithRelations = Question & {
  section: (Section & { examType: ExamType }) | null;
  choices: Choice[];
};

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // GET QUESTIONS (FILTERED)
  // ============================================================
  async findAllFiltered(dto: QuestionFilterQueryDto) {
    const { examTypeId, sectionId, limit = 30, page = 1, order = 'ASC' } = dto;

    const where: Prisma.QuestionWhereInput = {};

    if (sectionId) {
      where.section_id = sectionId;
    }

    if (examTypeId) {
      where.section = { exam_type_id: examTypeId };
    }

    const skip = (page - 1) * limit;

    const [questions, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        where,
        include: {
          section: { include: { examType: true } },
          choices: true,
        },
        orderBy: {
          id: order.toUpperCase() === 'DESC' ? 'desc' : 'asc',
        },
        skip,
        take: limit,
      }),
      this.prisma.question.count({ where }),
    ]);

    return {
      data: questions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================================
  // FIND ONE
  // ============================================================
  async findOne(id: string, strip = false) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        section: { include: { examType: true } },
        choices: true,
      },
    });

    if (!question) {
      throw new NotFoundException('السؤال غير موجود');
    }

    return strip ? this.stripAnswers([question])[0] : question;
  }

  // ============================================================
  // DELETE QUESTION
  // ============================================================
  async remove(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('السؤال غير موجود');
    }

    await this.prisma.question.delete({ where: { id } });

    return { id, success: true, message: 'تم حذف السؤال بنجاح' };
  }

  // ============================================================
  // STRIP ANSWERS (For challenge / public endpoints)
  // ============================================================
  private stripAnswers(questions: QuestionWithRelations[]) {
    return questions.map((question) => ({
      id: question.id,
      content: question.content,
      explanation: question.explanation,
      section: question.section
        ? {
            id: question.section.id,
            name: question.section.name,
            examType: question.section.examType
              ? {
                  id: question.section.examType.id,
                  name: question.section.examType.name,
                }
              : null,
          }
        : null,
      choices: (question.choices ?? []).map((choice) => ({
        id: choice.id,
        content: choice.content,
      })),
    }));
  }

  private validateChoices(
    choices?: { content: string; is_correct: boolean }[],
  ) {
    if (!choices || choices.length < 2 || choices.length > 4) {
      throw new BadRequestException('يجب أن يحتوي السؤال على 2 إلى 4 خيارات');
    }

    if (choices.some((c) => !c.content || !c.content.trim())) {
      throw new BadRequestException('يرجى تعبئة كافة نصوص الخيارات المضافة');
    }

    const correctCount = choices.filter((c) => c.is_correct === true).length;
    if (correctCount === 0) {
      throw new BadRequestException('يجب تحديد خيار صحيح واحد للإجابة');
    }
    if (correctCount > 1) {
      throw new BadRequestException('لا يمكن اختيار أكثر من خيار صحيح واحد');
    }
  }

  // ============================================================
  // CREATE QUESTION
  // ============================================================
  async create(createQuestionDto: CreateQuestionDto) {
    this.validateChoices(createQuestionDto.choices);

    const question = await this.prisma.question.create({
      data: {
        content: createQuestionDto.content,
        explanation: createQuestionDto.explanation,
        section_id: createQuestionDto.sectionId,
        choices: createQuestionDto.choices
          ? {
              create: createQuestionDto.choices,
            }
          : undefined,
      },
    });

    return await this.findOne(question.id, false);
  }

  // ============================================================
  // UPDATE QUESTION
  // ============================================================
  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('السؤال غير موجود');
    }

    if (updateQuestionDto.choices) {
      this.validateChoices(updateQuestionDto.choices);
    }

    await this.prisma.question.update({
      where: { id },
      data: {
        content: updateQuestionDto.content,
        explanation: updateQuestionDto.explanation,
        choices: updateQuestionDto.choices
          ? {
              deleteMany: {},
              create: updateQuestionDto.choices,
            }
          : undefined,
      },
    });

    return await this.findOne(id, false);
  }
}
