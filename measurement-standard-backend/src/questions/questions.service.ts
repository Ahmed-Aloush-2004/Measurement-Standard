import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';
import { UserResponse } from 'src/user-responses/entities/user-response.entity';

export interface QuestionFilter {
  examTypeId?: string;
  sectionId?: string;
  limit?: number;
  random?: boolean;
}

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,

    // @InjectRepository(UserResponse)
    // private readonly userResponseRepository:Repository<UserResponse>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const newQuestion = this.questionRepository.create({
      content: createQuestionDto.content,
      explanation: createQuestionDto.explanation,
      section: { id: createQuestionDto.sectionId },
    });
    return await this.questionRepository.save(newQuestion);
  }

  // التحدي اليومي: 30 سؤال لفظي + 30 سؤال كمي عشوائياً
  async getDailyChallenge() {
    console.log("this is a request");
    
    const verbalQuestions = await this.randomBySectionName('لفظي', 30);
    const quantitativeQuestions = await this.randomBySectionName('كمي', 30);
    return this.stripAnswers([...verbalQuestions, ...quantitativeQuestions]);
  }

  private async randomBySectionName(name: string, limit: number) {
    const idQuery = this.questionRepository
      .createQueryBuilder('question')
      .select('question.id', 'id')
      .innerJoin('question.section', 'section')
      .where('section.name LIKE :name', { name: `%${name}%` })
      .orderBy('RANDOM()')
      .limit(limit);

    const rows: { id: string }[] = await idQuery.getRawMany();
    const ids = rows.map((r) => r.id);
    if (ids.length === 0) return [];

    return this.questionRepository.find({
      where: { id: In(ids) },
      relations: { choices: true },
    });
  }

  // جلب الأسئلة مع فلاتر (نوع الاختبار / القسم / العدد / عشوائي)
  // بدون كشف الإجابات الصحيحة (is_correct)
  async findAllFiltered(filter: QuestionFilter = {}) {
    const idQuery = this.questionRepository
      .createQueryBuilder('question')
      // .select('question.')
      .select('question.id', 'id');


    if (filter.sectionId) {
      idQuery.andWhere('question.section_id = :sectionId', {
        sectionId: filter.sectionId,
      });
    }
    if (filter.examTypeId) {
      idQuery
        .innerJoin('question.section', 'section')
        .andWhere('section.exam_type_id = :examTypeId', {
          examTypeId: filter.examTypeId,
        });
    }
    if (filter.random) {
      idQuery.orderBy('RANDOM()');
    }
    if (filter.limit && filter.limit > 0) {
      idQuery.limit(filter.limit);
    }

    const rows: { id: string }[] = await idQuery.getRawMany();
    const ids = rows.map((r) => r.id);
    if (ids.length === 0) return [];

    const questions = await this.questionRepository.find({
      where: { id: In(ids) },
      relations: { section: true, choices: true },
    });

    // الحفاظ على الترتيب (خصوصاً الترتيب العشوائي)
    const order = new Map(ids.map((id, i) => [id, i]));
    questions.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

    return this.stripAnswers(questions);
  }

  // جميع أسئلة نوع اختبار محدد (يستخدم عند بدء اختبار جديد)
  async findByExamType(examTypeId: string, limit?: number) {
    return this.findAllFiltered({ examTypeId, limit, random: true });
  }

  async findOne(id: string) {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: { section: true, choices: true },
    });
    if (!question) {
      throw new NotFoundException('السؤال غير موجود');
    }
    const [stripped] = this.stripAnswers([question]);
    return stripped;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException('السؤال غير موجود');
    }

    if (updateQuestionDto.content) question.content = updateQuestionDto.content;
    if (updateQuestionDto.explanation) question.explanation = updateQuestionDto.explanation;
    if (updateQuestionDto.sectionId) {
      question.section = { id: updateQuestionDto.sectionId } as any;
    }

    return await this.questionRepository.save(question);
  }

  async remove(id: string) {
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question) throw new NotFoundException('السؤال غير موجود');
    return await this.questionRepository.remove(question);
  }

  // إزالة الإجابة الصحيحة من الرد الموجه للعميل لمنع الغش
  private stripAnswers(questions: Question[]): any[] {
    return questions.map((q) => ({
      ...q,
      choices: (q.choices ?? []).map(({ is_correct, ...rest }) => rest),
    }));
  }
}