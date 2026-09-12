// import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { CreateUserResponseDto } from './dto/create-user-response.dto';
// import { UserResponse } from './entities/user-response.entity';
// import { Choice } from '../choices/entities/choice.entity';

// @Injectable()
// export class UserResponsesService {
//   constructor(
//     @InjectRepository(UserResponse)
//     private readonly responseRepository: Repository<UserResponse>,
//     @InjectRepository(Choice)
//     private readonly choiceRepository: Repository<Choice>,
//   ) {}



//   // async create(userId: string, createDto: CreateUserResponseDto) {
//   //   // 1. البحث عن إجابة سابقة لنفس المستخدم ونفس السؤال
//   //   // استبدل findOneBy بـ findOne مع where
//   //   let response = await this.responseRepository.findOne({
//   //     where: {
//   //       user: { id: userId },
//   //       question: { id: createDto.questionId },
//   //     }
//   //   });

//   //   // 2. جلب الخيار للتأكد من صحته
//   //   const choice = await this.choiceRepository.findOne({
//   //     where: { id: createDto.selectedChoiceId },
//   //     relations: { question: true },
//   //   });

//   //   if (!choice || choice.question.id !== createDto.questionId) {
//   //     throw new BadRequestException('الخيار المختار لا ينتمي إلى هذا السؤال');
//   //   }

//   //   // 3. إذا كانت هناك إجابة سابقة، قم بتحديثها
//   //   if (response ) {
//   //     response.selectedChoice = choice;
//   //     response.is_correct = choice.is_correct;
//   //     response.answered_at = new Date(); // تأكد من أن هذا الحقل موجود في الـ Entity

//   //     // استخدام save سيقوم بعمل UPDATE تلقائياً لأن الكائن يمتلك id
//   //     response = await this.responseRepository.save(response);
//   //   }
//   //   // 4. إذا لم يسبق له الإجابة، قم بإنشاء إجابة جديدة
//   //   else {
//   //     response = this.responseRepository.create({
//   //       user: { id: userId },
//   //       question: { id: createDto.questionId },
//   //       selectedChoice: { id: choice.id },
//   //       is_correct: choice.is_correct,
//   //       answered_at: new Date(), 
//   //     });
      
//   //     await this.responseRepository.save(response);
//   //   }

//   //   return response;
//   // }



//   async create(
//   userId: string,
//   createDto: CreateUserResponseDto,
//   ) {
//   // 1. Get the selected choice
//   const choice = await this.choiceRepository.findOne({
//     where: {
//       id: createDto.selectedChoiceId,
//     },
//     relations: {
//       question: true,
//     },
//   });

//   if (!choice) {
//     throw new NotFoundException('الخيار غير موجود');
//   }

//   // 2. Make sure the choice belongs to the submitted question
//   if (choice.question.id !== createDto.questionId) {
//     throw new BadRequestException(
//       'الخيار المختار لا ينتمي إلى هذا السؤال',
//     );
//   }

//   // 3. Find the existing response for this USER + QUESTION
//   let response = await this.responseRepository.findOne({
//     where: {
//       user: {
//         id: userId,
//       },
//       question: {
//         id: createDto.questionId,
//       },
//     },
//     relations: {
//       user: true,
//       question: true,
//       selectedChoice: true,
//       session: true,
//     },
//   });

//   // 4. If response already exists → UPDATE it
//   if (response) {
//     response.selectedChoice = choice;
//     response.is_correct = choice.is_correct;
//     response.answered_at = new Date();

//     response = await this.responseRepository.save(response);

//     return response;
//   }

//   // 5. Otherwise → CREATE a new response
//   response = this.responseRepository.create({
//     user: {
//       id: userId,
//     },
//     question: {
//       id: createDto.questionId,
//     },
//     selectedChoice: choice,
//     is_correct: choice.is_correct,
//     answered_at: new Date(),
//   });

//   return await this.responseRepository.save(response);
// }

  
//   // جلب سجل الإجابات الخاص بمستخدم محدد
//   async findAllForUser(userId: string) {
//     return await this.responseRepository.find({
//       where: { user: { id: userId } },
//       relations: { question: true, selectedChoice: true },
//       order: { answered_at: 'DESC' }, // ترتيب من الأحدث للأقدم
//     });
//   }



//   // // جلب الأسئلة التي أخطأ فيها المستخدم لإعادة التدريب عليها
//   // // بما أننا نحدث الإجابة في دالة create، فالسجل الموجود دائماً هو أحدث محاولة
//   // async getMistakesForUser(userId: string) {
//   //   const responses = await this.responseRepository.find({
//   //     where: { user: { id: userId }, is_correct: false },
//   //     relations: {
//   //       question: { choices: true },
//   //       selectedChoice: true,
//   //     },
//   //     order: { answered_at: 'DESC' }, // ترتيب من الأحدث للأقدم
//   //   });

//   //   // إرجاع النتيجة مباشرة بدون الحاجة للتصفية (Deduplication)
//   //   return responses;
//   // }

//   // جلب الأسئلة التي أخطأ فيها المستخدم لإعادة التدريب عليها
//   // بما أننا نحدث الإجابة في دالة create، فالسجل الموجود دائماً هو أحدث محاولة
//   async getMistakesForUser(userId: string) {
//   return await this.responseRepository.find({
//     where: {
//       user: { id: userId },
//       is_correct: false,
//     },
//     relations: {
//       question: {
//         choices: true,
//       },
//       selectedChoice: true,
//     },
//     order: {
//       answered_at: 'DESC',
//     },
//   });
// }


// }






import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { CreateUserResponseDto } from './dto/create-user-response.dto';

import { UserResponse } from './entities/user-response.entity';

import { Choice } from '../choices/entities/choice.entity';

@Injectable()
export class UserResponsesService {
  constructor(
    @InjectRepository(UserResponse)
    private readonly responseRepository:
      Repository<UserResponse>,

    @InjectRepository(Choice)
    private readonly choiceRepository:
      Repository<Choice>,
  ) {}

  // ============================================================
  // CREATE / UPDATE USER RESPONSE
  // ============================================================

  async create(
    userId: string,
    createDto: CreateUserResponseDto,
  ) {
    // ----------------------------------------------------------
    // 1. Find selected choice
    // ----------------------------------------------------------

    const choice =
      await this.choiceRepository.findOne({
        where: {
          id: createDto.selectedChoiceId,
        },

        relations: {
          question: true,
        },
      });

    // ----------------------------------------------------------
    // 2. Make sure choice exists
    // ----------------------------------------------------------

    if (!choice) {
      throw new NotFoundException(
        'الخيار غير موجود',
      );
    }

    // ----------------------------------------------------------
    // 3. Make sure choice belongs to the question
    // ----------------------------------------------------------

    if (
      choice.question.id !==
      createDto.questionId
    ) {
      throw new BadRequestException(
        'الخيار المختار لا ينتمي إلى هذا السؤال',
      );
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

    let response =
      await this.responseRepository.findOne({
        where: {
          user: {
            id: userId,
          },

          question: {
            id: createDto.questionId,
          },
        },

        relations: {
          user: true,
          question: true,
          selectedChoice: true,
          session: true,
        },
      });



    // ==========================================================
    // CASE 1:
    // Existing response found
    // ==========================================================

    if (response) {
      // --------------------------------------------------------
      // Update selected choice
      // --------------------------------------------------------

      response.selectedChoice =
        choice;

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
      if(response.is_correct === true &&  choice.is_correct === false){
        throw new BadRequestException('لا يمكنك تغيير إجابة سؤال صحيحة إلى إجابة خاطئة')
      }
      response.is_correct =
        choice.is_correct;

      // --------------------------------------------------------
      // Save updated response
      // --------------------------------------------------------

      response =
        await this.responseRepository.save(
          response,
        );

      return response;
    }

    // ==========================================================
    // CASE 2:
    // No previous response
    // ==========================================================

    response =
      this.responseRepository.create({
        user: {
          id: userId,
        },

        question: {
          id: createDto.questionId,
        },

        selectedChoice:
          choice,

        is_correct:
          choice.is_correct,
      });

    // ----------------------------------------------------------
    // Save new response
    // ----------------------------------------------------------

    return await this.responseRepository.save(
      response,
    );
  }

  // ============================================================
  // GET ALL RESPONSES FOR USER
  // ============================================================

  async findAllForUser(
    userId: string,
  ) {
    return await this.responseRepository.find({
      where: {
        user: {
          id: userId,
        },
      },

      relations: {
        question: true,
        selectedChoice: true,
        session: true,
      },

      order: {
        answered_at: 'DESC',
      },
    });
  }

  // ============================================================
  // GET USER MISTAKES
  // ============================================================

  async getMistakesForUser(
    userId: string,
  ) {
    return await this.responseRepository.find({
      where: {
        user: {
          id: userId,
        },

        is_correct: false,
      },

      relations: {
        question: {
          choices: true,
        },

        selectedChoice: true,

        session: true,
      },

      order: {
        answered_at: 'DESC',
      },
    });
  }
}