import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // CREATE SECTION
  // ============================================================

  async create(createSectionDto: CreateSectionDto) {
    const examType = await this.prisma.examType.findUnique({
      where: {
        id: createSectionDto.examTypeId,
      },
    });

    if (!examType) {
      throw new NotFoundException(
        `نوع الاختبار برقم ${createSectionDto.examTypeId} غير موجود`,
      );
    }

    return await this.prisma.section.create({
      data: {
        name: createSectionDto.name,
        exam_type_id: createSectionDto.examTypeId,
      },
    });
  }

  // ============================================================
  // GET ALL SECTIONS
  // ============================================================

  async findAll() {
    return await this.prisma.section.findMany({
      include: {
        examType: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // ============================================================
  // GET SECTIONS FOR ONE EXAM TYPE
  //
  // GET /sections/exam-type/:examTypeId
  // ============================================================

  async findByExamType(examTypeId: string) {
    const examType = await this.prisma.examType.findUnique({
      where: {
        id: examTypeId,
      },
    });

    if (!examType) {
      throw new NotFoundException(`نوع الاختبار برقم ${examTypeId} غير موجود`);
    }

    return await this.prisma.section.findMany({
      where: {
        exam_type_id: examTypeId,
      },
      include: {
        examType: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // ============================================================
  // GET ONE SECTION
  // ============================================================

  async findOne(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        examType: true,
        questions: true,
      },
    });

    if (!section) {
      throw new NotFoundException(`القسم برقم ${id} غير موجود`);
    }

    return section;
  }

  // ============================================================
  // GET ONE SECTION WITH QUESTIONS AND CHOICES
  //
  // Useful for admin/debugging.
  // Do NOT use this endpoint directly for taking an exam
  // because Question choices may contain is_correct.
  // ============================================================

  async findOneWithQuestions(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        examType: true,
        questions: {
          include: {
            choices: true,
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException(`القسم برقم ${id} غير موجود`);
    }

    return section;
  }

  // ============================================================
  // UPDATE
  // ============================================================

  async update(id: string, updateSectionDto: UpdateSectionDto) {
    const section = await this.prisma.section.findUnique({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException(`القسم برقم ${id} غير موجود`);
    }

    const data: { name?: string; exam_type_id?: string } = {};

    if (updateSectionDto.name !== undefined) {
      data.name = updateSectionDto.name;
    }

    if (updateSectionDto.examTypeId !== undefined) {
      const examType = await this.prisma.examType.findUnique({
        where: {
          id: updateSectionDto.examTypeId,
        },
      });

      if (!examType) {
        throw new NotFoundException(
          `نوع الاختبار برقم ${updateSectionDto.examTypeId} غير موجود`,
        );
      }

      data.exam_type_id = updateSectionDto.examTypeId;
    }

    return await this.prisma.section.update({
      where: { id },
      data,
    });
  }

  // ============================================================
  // DELETE
  // ============================================================

  async remove(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException(`القسم برقم ${id} غير موجود`);
    }

    await this.prisma.section.delete({ where: { id } });

    return {
      success: true,
      message: 'تم حذف القسم بنجاح',
    };
  }
}
