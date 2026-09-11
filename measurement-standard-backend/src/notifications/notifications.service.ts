import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(userId: string, createDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create({
      user: { id: userId },
      title: createDto.title,
      message: createDto.message,
    });
    return await this.notificationRepository.save(notification);
  }

  async findAllForUser(userId: string) {
    return await this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('الإشعار غير موجود');
    }

    notification.is_read = true;
    return await this.notificationRepository.save(notification);
  }
}