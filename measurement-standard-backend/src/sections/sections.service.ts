
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

import { Section } from './entities/section.entity';
import { ExamType } from '../exam-types/entities/exam-type.entity';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,

    @InjectRepository(ExamType)
    private readonly examTypeRepository: Repository<ExamType>,
  ) {}

  // ============================================================
  // CREATE SECTION
  // ============================================================

  async create(createSectionDto: CreateSectionDto) {
    const examType = await this.examTypeRepository.findOne({
      where: {
        id: createSectionDto.examTypeId,
      },
    });

    if (!examType) {
      throw new NotFoundException(
        `نوع الاختبار برقم ${createSectionDto.examTypeId} غير موجود`,
      );
    }

    const section = this.sectionRepository.create({
      name: createSectionDto.name,
      examType,
    });

    return await this.sectionRepository.save(section);
  }

  // ============================================================
  // GET ALL SECTIONS
  // ============================================================

  async findAll() {
    return await this.sectionRepository.find({
      relations: {
        examType: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  // ============================================================
  // GET SECTIONS FOR ONE EXAM TYPE
  //
  // GET /sections/exam-type/:examTypeId
  // ============================================================

  async findByExamType(examTypeId: string) {
    const examType = await this.examTypeRepository.findOne({
      where: {
        id: examTypeId,
      },
    });

    if (!examType) {
      throw new NotFoundException(
        `نوع الاختبار برقم ${examTypeId} غير موجود`,
      );
    }

    return await this.sectionRepository.find({
      where: {
        examType: {
          id: examTypeId,
        },
      },
      relations: {
        examType: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  // ============================================================
  // GET ONE SECTION
  // ============================================================

  async findOne(id: string) {
    const section = await this.sectionRepository.findOne({
      where: {
        id,
      },
      relations: {
        examType: true,
        questions: true,
      },
    });

    if (!section) {
      throw new NotFoundException(
        `القسم برقم ${id} غير موجود`,
      );
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
    const section = await this.sectionRepository.findOne({
      where: {
        id,
      },
      relations: {
        examType: true,
        questions: {
          choices: true,
        },
      },
    });

    if (!section) {
      throw new NotFoundException(
        `القسم برقم ${id} غير موجود`,
      );
    }

    return section;
  }

  // ============================================================
  // UPDATE
  // ============================================================

  async update(
    id: string,
    updateSectionDto: UpdateSectionDto,
  ) {
    const section = await this.sectionRepository.findOne({
      where: {
        id,
      },
      relations: {
        examType: true,
      },
    });

    if (!section) {
      throw new NotFoundException(
        `القسم برقم ${id} غير موجود`,
      );
    }

    if (updateSectionDto.name !== undefined) {
      section.name = updateSectionDto.name;
    }

    if (updateSectionDto.examTypeId !== undefined) {
      const examType = await this.examTypeRepository.findOne({
        where: {
          id: updateSectionDto.examTypeId,
        },
      });

      if (!examType) {
        throw new NotFoundException(
          `نوع الاختبار برقم ${updateSectionDto.examTypeId} غير موجود`,
        );
      }

      section.examType = examType;
    }

    return await this.sectionRepository.save(section);
  }

  // ============================================================
  // DELETE
  // ============================================================

  async remove(id: string) {
    const section = await this.sectionRepository.findOne({
      where: {
        id,
      },
    });

    if (!section) {
      throw new NotFoundException(
        `القسم برقم ${id} غير موجود`,
      );
    }

    await this.sectionRepository.remove(section);

    return {
      success: true,
      message: 'تم حذف القسم بنجاح',
    };
  }
}