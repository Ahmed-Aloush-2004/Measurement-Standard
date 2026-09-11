import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const newQuestion = this.questionRepository.create({
      content: createQuestionDto.content,
      explanation: createQuestionDto.explanation,
      section: { id: createQuestionDto.sectionId },
    });
    return await this.questionRepository.save(newQuestion);
  }

  // خوارزمية التحدي اليومي (30 سؤال كمي و 30 سؤال لفظي عشوائياً)
  async getDailyChallenge() {
    const verbalQuestions = await this.questionRepository
      .createQueryBuilder('question')
      .innerJoinAndSelect('question.choices', 'choices')
      .innerJoin('question.section', 'section')
      .where('section.name = :name', { name: 'لفظي' })
      .orderBy('RANDOM()')
      .limit(30)
      .getMany();

    const quantitativeQuestions = await this.questionRepository
      .createQueryBuilder('question')
      .innerJoinAndSelect('question.choices', 'choices')
      .innerJoin('question.section', 'section')
      .where('section.name = :name', { name: 'كمي' })
      .orderBy('RANDOM()')
      .limit(30)
      .getMany();

    // دمج المصفوفتين في مصفوفة واحدة
    return [...verbalQuestions, ...quantitativeQuestions];
  }

  async findAll() {
    return await this.questionRepository.find({
      relations: { section: true, choices: true },
    });
  }

  async findOne(id: string) {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: { section: true, choices: true },
    });
    if (!question) {
      throw new NotFoundException(`السؤال غير موجود`);
    }
    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.findOne(id);
    
    if (updateQuestionDto.content) question.content = updateQuestionDto.content;
    if (updateQuestionDto.explanation) question.explanation = updateQuestionDto.explanation;
    if (updateQuestionDto.sectionId) {
      question.section = { id: updateQuestionDto.sectionId } as any;
    }
    
    return await this.questionRepository.save(question);
  }

  async remove(id: string) {
    const question = await this.findOne(id);
    return await this.questionRepository.remove(question);
  }
}