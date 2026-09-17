

// import {
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';

// import { InjectRepository } from '@nestjs/typeorm';

// import {
//   In,
//   Repository,
// } from 'typeorm';

// import { CreateQuestionDto } from './dto/create-question.dto';
// import { UpdateQuestionDto } from './dto/update-question.dto';

// import { Question } from './entities/question.entity';
// import { QuestionFilterQueryDto } from './dto/question-filter.query.dto';
// import { Choice } from 'src/choices/entities/choice.entity';

// @Injectable()
// export class QuestionsService {
//   constructor(
//     @InjectRepository(Question)
//     private readonly questionRepository: Repository<Question>,

//     @InjectRepository(Choice)
//     private readonly choiceRepository: Repository<Choice>,

//   ) { }

//   // ============================================================
//   // CREATE QUESTION
//   // ============================================================

//   // async create(
//   //   createQuestionDto: CreateQuestionDto,
//   // ) {
//   //   let choices:[Choice]|[]=[];

//   //   const question =
//   //     this.questionRepository.create({
//   //       content: createQuestionDto.content,
//   //       explanation:
//   //         createQuestionDto.explanation,

//   //       section: {
//   //         id: createQuestionDto.sectionId,
//   //       },
//   //     });



//   //   const saved =
//   //     await this.questionRepository.save(question);

//   //   return await this.findOne(saved.id);
//   // }




//   async create(createQuestionDto: CreateQuestionDto) {
//     const { choices, sectionId, ...questionData } = createQuestionDto;
//     console.warn('this is the createQuestionDto : ', createQuestionDto)
//     const question = this.questionRepository.create({
//       ...questionData,
//       section: { id: sectionId },
//       choices: choices ? choices.map((c) => this.choiceRepository.create(c)) : [],
//     });

//     return await this.questionRepository.save(question);
//   }






//   // ============================================================
//   // DAILY CHALLENGE
//   // ============================================================

//   async getDailyChallenge() {
//     const verbalQuestions =
//       await this.randomBySectionName(
//         'لفظي',
//         30,
//       );

//     const quantitativeQuestions =
//       await this.randomBySectionName(
//         'كمي',
//         30,
//       );

//     return this.stripAnswers([
//       ...verbalQuestions,
//       ...quantitativeQuestions,
//     ]);
//   }

//   // ============================================================
//   // RANDOM QUESTIONS BY SECTION NAME
//   //
//   // Kept only for the daily challenge.
//   // Normal app screens should use IDs instead of names.
//   // ============================================================

//   private async randomBySectionName(
//     name: string,
//     limit: number,
//   ) {
//     const rows =
//       await this.questionRepository
//         .createQueryBuilder('question')
//         .select('question.id', 'id')
//         .innerJoin(
//           'question.section',
//           'section',
//         )
//         .where(
//           'section.name LIKE :name',
//           {
//             name: `%${name}%`,
//           },
//         )
//         .orderBy('RANDOM()')
//         .limit(limit)
//         .getRawMany();

//     const ids = rows.map(
//       (row: { id: string }) => row.id,
//     );

//     if (ids.length === 0) {
//       return [];
//     }

//     const questions =
//       await this.questionRepository.find({
//         where: {
//           id: In(ids),
//         },
//         relations: {
//           section: {
//             examType: true,
//           },
//           choices: true,
//         },
//       });

//     const order = new Map(
//       ids.map((id, index) => [
//         id,
//         index,
//       ]),
//     );

//     questions.sort(
//       (a, b) =>
//         (order.get(a.id) ?? 0) -
//         (order.get(b.id) ?? 0),
//     );

//     return questions;
//   }

//   // ============================================================
//   // GET QUESTIONS
//   //
//   // Supported:
//   //
//   // /questions
//   // /questions?examTypeId=...
//   // /questions?sectionId=...
//   // /questions?examTypeId=...&sectionId=...
//   // /questions?sectionId=...&limit=10&random=true
//   // ============================================================


//   async findAllFiltered(dto: QuestionFilterQueryDto) {
//     const { examTypeId, sectionId, limit = 30, page = 1, order = 'ASC' } = dto;

//     const query = this.questionRepository
//       .createQueryBuilder('question')
//       .leftJoinAndSelect('question.section', 'section')
//       .leftJoinAndSelect('section.examType', 'examType')
//       .leftJoinAndSelect('question.choices', 'choices');

//     // Filter by section
//     if (sectionId) {
//       query.andWhere('section.id = :sectionId', { sectionId });
//     }

//     // Filter by exam type
//     if (examTypeId) {
//       query.andWhere('examType.id = :examTypeId', { examTypeId });
//     }

//     // Sorting & Pagination
//     const skip = (page - 1) * limit;

//     query
//       .orderBy('question.id', order.toUpperCase() as 'ASC' | 'DESC')
//       .take(limit)
//       .skip(skip);

//     const [questions, total] = await query.getManyAndCount();

//     const sanitizedQuestions = this.stripAnswers(questions);

//     return {
//       data: sanitizedQuestions,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }






//   // ============================================================
//   // QUESTIONS BY EXAM TYPE
//   // ============================================================

//   async findByExamType(
//     examTypeId: string,
//     limit?: number,
//   ) {
//     return this.findAllFiltered({
//       examTypeId,
//       limit,
//     });
//   }

//   // ============================================================
//   // QUESTIONS BY SECTION
//   // ============================================================

//   async findBySection(
//     sectionId: string,
//     limit?: number,
//   ) {
//     return this.findAllFiltered({
//       sectionId,
//       limit,
//     });
//   }

//   // ============================================================
//   // ONE QUESTION
//   // ============================================================

//   async findOne(id: string) {
//     const question =
//       await this.questionRepository.findOne({
//         where: {
//           id,
//         },

//         relations: {
//           section: {
//             examType: true,
//           },

//           choices: true,
//         },
//       });

//     if (!question) {
//       throw new NotFoundException(
//         'السؤال غير موجود',
//       );
//     }

//     const [safeQuestion] =
//       this.stripAnswers([
//         question,
//       ]);

//     return safeQuestion;
//   }

//   // ============================================================
//   // UPDATE
//   // ============================================================

//   async update(
//     id: string,
//     updateQuestionDto: UpdateQuestionDto,
//   ) {
//     const question =
//       await this.questionRepository.findOne({
//         where: {
//           id,
//         },
//       });

//     if (!question) {
//       throw new NotFoundException(
//         'السؤال غير موجود',
//       );
//     }

//     if (
//       updateQuestionDto.content !==
//       undefined
//     ) {
//       question.content =
//         updateQuestionDto.content;
//     }

//     if (
//       updateQuestionDto.explanation !==
//       undefined
//     ) {
//       question.explanation =
//         updateQuestionDto.explanation;
//     }

//     if (
//       updateQuestionDto.sectionId !==
//       undefined
//     ) {
//       question.section = {
//         id: updateQuestionDto.sectionId,
//       } as any;
//     }

//     const saved =
//       await this.questionRepository.save(
//         question,
//       );

//     return await this.findOne(
//       saved.id,
//     );
//   }

//   // ============================================================
//   // DELETE
//   // ============================================================

//   async remove(id: string) {
//     const question =
//       await this.questionRepository.findOne({
//         where: {
//           id,
//         },
//       });

//     if (!question) {
//       throw new NotFoundException(
//         'السؤال غير موجود',
//       );
//     }

//     await this.questionRepository.remove(
//       question,
//     );

//     return {
//       success: true,
//       message: 'تم حذف السؤال بنجاح',
//     };
//   }

//   // ============================================================
//   // REMOVE CORRECT ANSWER FROM CLIENT RESPONSE
//   // ============================================================

//   private stripAnswers(
//     questions: Question[],
//   ): any[] {
//     return questions.map(
//       (question) => ({
//         id: question.id,

//         content: question.content,

//         explanation:
//           question.explanation,

//         section: question.section
//           ? {
//             id: question.section.id,
//             name: question.section.name,

//             examType:
//               question.section.examType
//                 ? {
//                   id:
//                     question.section
//                       .examType.id,

//                   name:
//                     question.section
//                       .examType.name,
//                 }
//                 : null,
//           }
//           : null,

//         choices: (
//           question.choices ?? []
//         ).map(
//           ({
//             is_correct,
//             ...choice
//           }) => choice,
//         ),
//       }),
//     );
//   }
// }










import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';
import { QuestionFilterQueryDto } from './dto/question-filter.query.dto';
import { Choice } from '../choices/entities/choice.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Choice)
    private readonly choiceRepository: Repository<Choice>,
  ) {}

  // // ============================================================
  // // CREATE QUESTION
  // // ============================================================
  // async create(createQuestionDto: CreateQuestionDto) {
  //   const { choices, sectionId, ...questionData } = createQuestionDto;
  //   this.validateChoices(choices)
  //   const question = this.questionRepository.create({
  //     ...questionData,
  //     section: { id: sectionId },
  //     choices: choices ? choices.map((c) => this.choiceRepository.create(c)) : [],
  //   });

  //   const saved = await this.questionRepository.save(question);
  //   return await this.findOne(saved.id, false); // false = do not strip answers for admin responses
  // }

  // ============================================================
  // GET QUESTIONS (FILTERED)
  // ============================================================
  async findAllFiltered(dto: QuestionFilterQueryDto) {
    const { examTypeId, sectionId, limit = 30, page = 1, order = 'ASC' } = dto;

    const query = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.section', 'section')
      .leftJoinAndSelect('section.examType', 'examType')
      .leftJoinAndSelect('question.choices', 'choices');

    if (sectionId) {
      query.andWhere('section.id = :sectionId', { sectionId });
    }

    if (examTypeId) {
      query.andWhere('examType.id = :examTypeId', { examTypeId });
    }

    const skip = (page - 1) * limit;

    query
      .orderBy('question.id', order.toUpperCase() as 'ASC' | 'DESC')
      .take(limit)
      .skip(skip);

    const [questions, total] = await query.getManyAndCount();

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
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: {
        section: { examType: true },
        choices: true,
      },
    });

    if (!question) {
      throw new NotFoundException('السؤال غير موجود');
    }

    return strip ? this.stripAnswers([question])[0] : question;
  }

  // // ============================================================
  // // UPDATE QUESTION
  // // ============================================================
  // async update(id: string, updateQuestionDto: UpdateQuestionDto) {
  //   const question = await this.questionRepository.findOne({
  //     where: { id },
  //     relations: { choices: true },
  //   });

  //   if (!question) {
  //     throw new NotFoundException('السؤال غير موجود');
  //   }

  //   if (updateQuestionDto.content !== undefined) {
  //     question.content = updateQuestionDto.content;
  //   }

  //   if (updateQuestionDto.explanation !== undefined) {
  //     question.explanation = updateQuestionDto.explanation;
  //   }

  //   if (updateQuestionDto.sectionId !== undefined) {
  //     question.section = { id: updateQuestionDto.sectionId } as any;
  //   }

  //   // Update choices array if provided
  //   if (updateQuestionDto.choices) {
  //     // Remove old choices
  //     if (question.choices && question.choices.length > 0) {
  //       await this.choiceRepository.remove(question.choices);
  //     }
  //     // Re-assign new choices
  //     question.choices = updateQuestionDto.choices.map((c) =>
  //       this.choiceRepository.create(c),
  //     );
  //   }

  //   await this.questionRepository.save(question);
  //   return await this.findOne(id, false);
  // }

  // ============================================================
  // DELETE QUESTION
  // ============================================================
  async remove(id: string) {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: { choices: true },
    });

    if (!question) {
      throw new NotFoundException('السؤال غير موجود');
    }

    await this.questionRepository.remove(question);

    return { id, success: true, message: 'تم حذف السؤال بنجاح' };
  }

  // ============================================================
  // STRIP ANSWERS (For challenge / public endpoints)
  // ============================================================
  private stripAnswers(questions: Question[]): any[] {
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
      choices: (question.choices ?? []).map(({ is_correct, ...choice }) => choice),
    }));
  }



private validateChoices(choices?: { content: string; is_correct: boolean }[]) {
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

  async create(createQuestionDto: CreateQuestionDto) {
    this.validateChoices(createQuestionDto.choices);

    const question = this.questionRepository.create({
      content: createQuestionDto.content,
      explanation: createQuestionDto.explanation,
      section: { id: createQuestionDto.sectionId },
      choices: createQuestionDto.choices,
    });

    return await this.questionRepository.save(question);
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: {choices : true },
    });

    if (!question) {
      throw new NotFoundException('السؤال غير موجود');
    }

    if (updateQuestionDto.choices) {
      this.validateChoices(updateQuestionDto.choices);
    }

    if (updateQuestionDto.content !== undefined) {
      question.content = updateQuestionDto.content;
    }
    if (updateQuestionDto.explanation !== undefined) {
      question.explanation = updateQuestionDto.explanation;
    }

    if (updateQuestionDto.choices) {
      // Remove old choices
      await this.choiceRepository.delete({ question: { id } });

      // Create new choices array
      question.choices = updateQuestionDto.choices.map((c) =>
        this.choiceRepository.create({
          content: c.content,
          is_correct: c.is_correct,
        }),
      );
    }

    return await this.questionRepository.save(question);
  }
}