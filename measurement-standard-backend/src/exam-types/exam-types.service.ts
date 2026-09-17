

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateExamTypeDto } from './dto/create-exam-type.dto';
import { UpdateExamTypeDto } from './dto/update-exam-type.dto';

import { ExamType } from './entities/exam-type.entity';

import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ExamTypesService {
  constructor(
    @InjectRepository(ExamType)
    private readonly examTypeRepository: Repository<ExamType>,

    private readonly notificationsService: NotificationsService,
  ) {}

  // ============================================================
  // CREATE
  // ============================================================

  async create(
    createExamTypeDto: CreateExamTypeDto,
  ) {
    const existing =
      await this.examTypeRepository.findOne({
        where: {
          code: createExamTypeDto.code,
        },
      });

    if (existing) {
      throw new Error(
        `نوع الاختبار بالرمز ${createExamTypeDto.code} موجود مسبقاً`,
      );
    }

    const examType =
      this.examTypeRepository.create(
        createExamTypeDto,
      );

    // IMPORTANT:
    // Save first so PostgreSQL generates the UUID.
    const savedExamType =
      await this.examTypeRepository.save(
        examType,
      );

    // Now the ID exists.
    await this.notificationsService.create({
      title: 'نوع اختبار جديد',

      message: `تمت إضافة نوع اختبار جديد: ${savedExamType.name}`,

      type: 'NEW_EXAM_TYPE',

      url: `/exam-type/${savedExamType.id}`,

      data: {
        examTypeId:savedExamType.id,
        title:examType.name,
        code:savedExamType.code,
      },
    });

    return await this.findOne(
      savedExamType.id,
    );
  }

  // ============================================================
  // GET ALL
  // ============================================================

  async findAll() {
    return await this.examTypeRepository.find({
      relations: {
        sections: true,
      },

      order: {
        name: 'ASC',
      },
    });
  }

  // ============================================================
  // GET ONE
  // ============================================================

  async findOne(id: string) {
    const examType =
      await this.examTypeRepository.findOne({
        where: {
          id,
        },

        relations: {
          sections: true,
        },
      });

    if (!examType) {
      throw new NotFoundException(
        `نوع الاختبار برقم ${id} غير موجود`,
      );
    }

    return examType;
  }

  // ============================================================
  // UPDATE
  // ============================================================

  async update(
    id: string,
    updateExamTypeDto: UpdateExamTypeDto,
  ) {
    const examType =
      await this.findOne(id);

    if (
      updateExamTypeDto.code &&
      updateExamTypeDto.code !==
        examType.code
    ) {
      const existing =
        await this.examTypeRepository.findOne({
          where: {
            code:
              updateExamTypeDto.code,
          },
        });

      if (
        existing &&
        existing.id !== id
      ) {
        throw new Error(
          `رمز الاختبار ${updateExamTypeDto.code} مستخدم مسبقاً`,
        );
      }
    }

    Object.assign(
      examType,
      updateExamTypeDto,
    );

    return await this.examTypeRepository.save(
      examType,
    );
  }

  // ============================================================
  // DELETE
  // ============================================================

  async remove(id: string) {
    const examType =
      await this.findOne(id);

    await this.examTypeRepository.remove(
      examType,
    );

    return {
      success: true,
      message:
        'تم حذف نوع الاختبار بنجاح',
    };
  }
}