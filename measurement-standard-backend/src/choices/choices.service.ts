import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChoiceDto } from './dto/create-choice.dto';
import { UpdateChoiceDto } from './dto/update-choice.dto';
import { Choice } from './entities/choice.entity';

@Injectable()
export class ChoicesService {
  constructor(
    @InjectRepository(Choice)
    private readonly choiceRepository: Repository<Choice>,
  ) {}

  async create(createChoiceDto: CreateChoiceDto) {
    const newChoice = this.choiceRepository.create({
      content: createChoiceDto.content,
      is_correct: createChoiceDto.is_correct,
      question: { id: createChoiceDto.questionId }, // ربط الخيار بالسؤال
    });
    return await this.choiceRepository.save(newChoice);
  }

  async findAll() {
    return await this.choiceRepository.find({
      relations: { question: true },
    });
  }

  async findOne(id: string) {
    const choice = await this.choiceRepository.findOne({
      where: { id },
      relations: { question: true },
    });
    if (!choice) {
      throw new NotFoundException(`الخيار غير موجود`);
    }
    return choice;
  }

  async update(id: string, updateChoiceDto: UpdateChoiceDto) {
    const choice = await this.findOne(id);
    
    if (updateChoiceDto.content) choice.content = updateChoiceDto.content;
    if (updateChoiceDto.is_correct !== undefined) choice.is_correct = updateChoiceDto.is_correct;
    if (updateChoiceDto.questionId) {
      choice.question = { id: updateChoiceDto.questionId } as any;
    }
    
    return await this.choiceRepository.save(choice);
  }

  async remove(id: string) {
    const choice = await this.findOne(id);
    return await this.choiceRepository.remove(choice);
  }
}