import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async add(userId: string, questionId: string) {
    // التحقق مما إذا كان السؤال موجوداً بالفعل في مفضلة هذا المستخدم
    const existingFavorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, question: { id: questionId } },
    });

    if (existingFavorite) {
      throw new ConflictException('السؤال موجود بالفعل في المفضلة');
    }

    const favorite = this.favoriteRepository.create({
      user: { id: userId },
      question: { id: questionId },
    });

    return await this.favoriteRepository.save(favorite);
  }

  async findAllForUser(userId: string) {
    return await this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: { question: { choices: true, section: true } },
      order: { created_at: 'DESC' }, // عرض الأحدث أولاً
    });
  }

  async remove(userId: string, questionId: string) {
    const favorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, question: { id: questionId } },
    });

    if (!favorite) {
      throw new NotFoundException('السؤال غير موجود في المفضلة');
    }

    return await this.favoriteRepository.remove(favorite);
  }
}