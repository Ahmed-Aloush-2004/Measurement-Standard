import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: string, questionId: string) {
    // التحقق مما إذا كان السؤال موجوداً بالفعل في مفضلة هذا المستخدم
    const existingFavorite = await this.prisma.favorite.findFirst({
      where: { user_id: userId, question_id: questionId },
    });

    if (existingFavorite) {
      throw new ConflictException('السؤال موجود بالفعل في المفضلة');
    }

    return await this.prisma.favorite.create({
      data: { user_id: userId, question_id: questionId },
    });
  }

  async findAllForUser(userId: string) {
    return await this.prisma.favorite.findMany({
      where: { user_id: userId },
      include: {
        question: {
          include: {
            choices: true,
            section: true,
          },
        },
      },
      orderBy: { created_at: 'desc' }, // عرض الأحدث أولاً
    });
  }

  async remove(userId: string, questionId: string) {
    const favorite = await this.prisma.favorite.findFirst({
      where: { user_id: userId, question_id: questionId },
    });

    if (!favorite) {
      throw new NotFoundException('السؤال غير موجود في المفضلة');
    }

    return await this.prisma.favorite.delete({ where: { id: favorite.id } });
  }
}
