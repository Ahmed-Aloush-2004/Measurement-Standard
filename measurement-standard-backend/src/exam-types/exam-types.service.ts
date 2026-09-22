import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateExamTypeDto } from './dto/create-exam-type.dto';
import { UpdateExamTypeDto } from './dto/update-exam-type.dto';

import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExamTypesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ============================================================
  // CREATE
  // ============================================================

  async create(createExamTypeDto: CreateExamTypeDto) {
    const existing = await this.prisma.examType.findUnique({
      where: {
        code: createExamTypeDto.code,
      },
    });

    if (existing) {
      throw new Error(
        `نوع الاختبار بالرمز ${createExamTypeDto.code} موجود مسبقاً`,
      );
    }

    const savedExamType = await this.prisma.examType.create({
      data: createExamTypeDto,
    });

    // Now the ID exists.
    await this.notificationsService.create({
      title: 'نوع اختبار جديد',
      message: `تمت إضافة نوع اختبار جديد: ${savedExamType.name}`,
      type: 'NEW_EXAM_TYPE',
      url: `/exam-type/${savedExamType.id}`,
      data: {
        examTypeId: savedExamType.id,
        title: createExamTypeDto.name,
        code: savedExamType.code,
      },
    });

    return await this.findOne(savedExamType.id);
  }

  // ============================================================
  // GET ALL
  // ============================================================

  async findAll() {
    return await this.prisma.examType.findMany({
      include: {
        sections: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // ============================================================
  // GET ONE
  // ============================================================

  async findOne(id: string) {
    const examType = await this.prisma.examType.findUnique({
      where: { id },
      include: {
        sections: true,
      },
    });

    if (!examType) {
      throw new NotFoundException(`نوع الاختبار برقم ${id} غير موجود`);
    }

    return examType;
  }

  // ============================================================
  // UPDATE
  // ============================================================

  async update(id: string, updateExamTypeDto: UpdateExamTypeDto) {
    const examType = await this.findOne(id);

    if (updateExamTypeDto.code && updateExamTypeDto.code !== examType.code) {
      const existing = await this.prisma.examType.findUnique({
        where: {
          code: updateExamTypeDto.code,
        },
      });

      if (existing && existing.id !== id) {
        throw new Error(`رمز الاختبار ${updateExamTypeDto.code} مستخدم مسبقاً`);
      }
    }

    return await this.prisma.examType.update({
      where: { id },
      data: updateExamTypeDto,
    });
  }

  // ============================================================
  // DELETE
  // ============================================================

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.examType.delete({ where: { id } });

    return {
      success: true,
      message: 'تم حذف نوع الاختبار بنجاح',
    };
  }
}
