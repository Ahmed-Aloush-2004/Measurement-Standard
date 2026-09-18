import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChoiceDto } from './dto/create-choice.dto';
import { UpdateChoiceDto } from './dto/update-choice.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createChoiceDto: CreateChoiceDto) {
    const newChoice = await this.prisma.choice.create({
      data: {
        content: createChoiceDto.content,
        is_correct: createChoiceDto.is_correct,
        question_id: createChoiceDto.questionId, // ربط الخيار بالسؤال
      },
    });
    return newChoice;
  }

  async findAll() {
    return await this.prisma.choice.findMany({
      include: { question: true },
    });
  }

  async findOne(id: string) {
    const choice = await this.prisma.choice.findUnique({
      where: { id },
      include: { question: true },
    });
    if (!choice) {
      throw new NotFoundException(`الخيار غير موجود`);
    }
    return choice;
  }

  async update(id: string, updateChoiceDto: UpdateChoiceDto) {
    await this.findOne(id);

    return await this.prisma.choice.update({
      where: { id },
      data: {
        content: updateChoiceDto.content,
        is_correct: updateChoiceDto.is_correct,
        question_id: updateChoiceDto.questionId,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.choice.delete({ where: { id } });
  }
}
