import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Section } from './entities/section.entity';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) {}

  async create(createSectionDto: CreateSectionDto) {
    const newSection = this.sectionRepository.create({
      name: createSectionDto.name,
      examType: { id: createSectionDto.examTypeId }, // ربط القسم بالاختبار الرئيسي
    });
    return await this.sectionRepository.save(newSection);
  }

  async findAll() {
    return await this.sectionRepository.find({
      relations: { examType: true, questions: true },
    });
  }

  async findOne(id: string) {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: { examType: true, questions: true },
    });
    if (!section) {
      throw new NotFoundException(`القسم برقم ${id} غير موجود`);
    }
    return section;
  }

  async update(id: string, updateSectionDto: UpdateSectionDto) {
    const section = await this.findOne(id);
    
    if (updateSectionDto.name) {
      section.name = updateSectionDto.name;
    }
    if (updateSectionDto.examTypeId) {
      // TypeORM يقبل تمرير الكائن لتحديث العلاقة
      section.examType = { id: updateSectionDto.examTypeId } as any; 
    }
    
    return await this.sectionRepository.save(section);
  }

  async remove(id: string) {
    const section = await this.findOne(id);
    return await this.sectionRepository.remove(section);
  }
}