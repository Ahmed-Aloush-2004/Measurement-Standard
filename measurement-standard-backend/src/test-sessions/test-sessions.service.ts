import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTestSessionDto } from './dto/create-test-session.dto';
import { TestSession } from './entities/test-session.entity';

@Injectable()
export class TestSessionsService {
  constructor(
    @InjectRepository(TestSession)
    private readonly testSessionRepository: Repository<TestSession>,
  ) {}

  async create(userId: string, createDto: CreateTestSessionDto) {
    const session = this.testSessionRepository.create({
      user: { id: userId },
      examType: { id: createDto.examTypeId },
      score: createDto.score,
      total_questions: createDto.total_questions,
    });

    return await this.testSessionRepository.save(session);
  }

  async findAllForUser(userId: string) {
    return await this.testSessionRepository.find({
      where: { user: { id: userId } },
      relations: { examType: true },
      order: { created_at: 'DESC' }, // عرض الاختبارات الأحدث أولاً
    });
  }
}