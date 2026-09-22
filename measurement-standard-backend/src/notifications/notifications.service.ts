import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from './notifications.gateway';
import { UsersService } from '../users/users.service';
import { Role } from '../auth/enums/role.enum';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Creates a notification for a single user or broadcasts to all.
   */
  async create(createDto: CreateNotificationDto) {
    const expiresAt = createDto.expiresAt
      ? new Date(createDto.expiresAt)
      : null;

    // 1. Handle Single User Notification
    if (createDto.user_email) {
      const user = await this.usersService.findByQuery({
        email: createDto.user_email,
      });

      const saved = await this.prisma.notification.create({
        data: {
          user_id: user.id,
          title: createDto.title,
          message: createDto.message,
          type: createDto.type ?? null,
          url: createDto.url ?? null,
          data: createDto.data,
          is_read: false,
          expires_at: expiresAt,
        },
      });

      this.notificationsGateway.sendToUser(user.id, saved);
      return saved;
    }

    // 2. Handle Broadcast (All Users)
    const users = await this.usersService.getUsersbyRoles([Role.USER]);

    const saved: Notification[] = [];
    for (const user of users) {
      const notification = await this.prisma.notification.create({
        data: {
          user_id: user.id,
          title: createDto.title,
          message: createDto.message,
          type: createDto.type ?? null,
          url: createDto.url ?? null,
          data: createDto.data,
          is_read: false,
          expires_at: expiresAt,
        },
      });
      saved.push(notification);

      // Broadcast via Socket
      this.notificationsGateway.sendToUser(user.id, {
        id: notification.id,
        title: createDto.title,
        message: createDto.message,
        type: createDto.type ?? null,
        url: createDto.url ?? null,
        data: createDto.data ?? null,
        is_read: false,
      });
    }

    return saved;
  }

  async findAllForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Efficiently updates all unread notifications to read using a single DB query.
   * No SELECT required.
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });

    if (result.count === 0) {
      throw new NotFoundException('لا توجد إشعارات غير مقروءة');
    }

    return { success: true, updated: result.count };
  }

  async markAsRead(id: string, userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id, user_id: userId },
      data: { is_read: true },
    });

    if (result.count === 0) {
      throw new NotFoundException('الإشعار غير موجود');
    }

    return { success: true };
  }

  async delete(id: string, userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: { id, user_id: userId },
    });

    if (result.count === 0) {
      throw new NotFoundException('الإشعار غير موجود');
    }

    return { success: true };
  }

  async deleteExpired() {
    const result = await this.prisma.notification.deleteMany({
      where: { expires_at: { lt: new Date() } },
    });

    return { deleted: result.count };
  }

  async deleteOldAndExpiredNotifications() {
    const now = new Date();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // This executes: DELETE FROM notifications WHERE expires_at < NOW() OR created_at < 7_DAYS_AGO
    const result = await this.prisma.notification.deleteMany({
      where: {
        OR: [{ expires_at: { lt: now } }, { created_at: { lt: oneWeekAgo } }],
      },
    });

    return result.count;
  }

  /**
   * Runs automatically every day at midnight (00:00).
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronCleanup() {
    this.logger.log('Starting automated notification cleanup...');

    try {
      const deletedCount = await this.deleteOldAndExpiredNotifications();
      this.logger.log(
        `Cleanup complete. Deleted ${deletedCount} old/expired notifications.`,
      );
    } catch (error) {
      this.logger.error('Failed to clean up notifications', error);
    }
  }
}
