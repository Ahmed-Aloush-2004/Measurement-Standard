import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { UserResponse } from './entities/user-response.entity';

@Injectable()
export class UserResponsesService {
  constructor(
    @InjectRepository(UserResponse)
    private readonly responseRepository: Repository<UserResponse>,
  ) {}

  async create(userId: string, createDto: CreateUserResponseDto) {
    const newResponse = this.responseRepository.create({
      user: { id: userId }, // يتم الربط بمعرف المستخدم القادم من التوكن
      question: { id: createDto.questionId },
      is_correct: createDto.is_correct,
    });
    return await this.responseRepository.save(newResponse);
  }

  // جلب سجل الإجابات الخاص بمستخدم محدد
  async findAllForUser(userId: string) {
    return await this.responseRepository.find({
      where: { user: { id: userId } },
      relations: { question: true },
      order: { answered_at: 'DESC' }, // ترتيب من الأحدث للأقدم
    });
  }

  // جلب الأسئلة التي أخطأ فيها المستخدم لإعادة التدريب عليها
  async getMistakesForUser(userId: string) {
    return await this.responseRepository.find({
      where: { user: { id: userId }, is_correct: false },
      relations: { question: { choices: true } },
    });
  }
}