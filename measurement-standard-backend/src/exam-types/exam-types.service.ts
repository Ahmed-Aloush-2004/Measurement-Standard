import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamTypeDto } from './dto/create-exam-type.dto';
import { UpdateExamTypeDto } from './dto/update-exam-type.dto';
import { ExamType } from './entities/exam-type.entity';

@Injectable()
export class ExamTypesService {
  constructor(
    @InjectRepository(ExamType)
    private readonly examTypeRepository: Repository<ExamType>,
  ) {}

  async create(createExamTypeDto: CreateExamTypeDto) {
    const newExamType = this.examTypeRepository.create(createExamTypeDto);
    return await this.examTypeRepository.save(newExamType);
  }

  async findAll() {
    return await this.examTypeRepository.find({
      relations: { sections: true },
    });
  }

  async findOne(id: string) {
    const examType = await this.examTypeRepository.findOne({
      where: { id },
      relations: { sections: true },
    });
    if (!examType) {
      throw new NotFoundException(`نوع الاختبار برقم ${id} غير موجود`);
    }
    return examType;
  }

  async update(id: string, updateExamTypeDto: UpdateExamTypeDto) {
    const examType = await this.findOne(id);
    Object.assign(examType, updateExamTypeDto);
    return await this.examTypeRepository.save(examType);
  }

  async remove(id: string) {
    const examType = await this.findOne(id);
    return await this.examTypeRepository.remove(examType);
  }
}