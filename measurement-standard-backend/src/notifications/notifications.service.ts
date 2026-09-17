// import {
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';

// import { InjectRepository } from '@nestjs/typeorm';
// import { LessThan, Repository } from 'typeorm';

// import { Notification } from './entities/notification.entity';
// import { CreateNotificationDto } from './dto/create-notification.dto';
// import { NotificationsGateway } from './notifications.gateway';
// import { UsersService } from 'src/users/users.service';
// import { Role } from 'src/auth/enums/role.enum';

// @Injectable()
// export class NotificationsService {
//   constructor(
//     @InjectRepository(Notification)
//     private readonly notificationRepository: Repository<Notification>,

//     private readonly usersService:UsersService,

//     private readonly notificationsGateway: NotificationsGateway,
//   ) { }



//   // @Cron('0 * * * *')
//   // async removeExpiredNotifications() {
//   //   await this.notificationsService.deleteExpired();
//   // }




//   async create(
//     createDto: CreateNotificationDto,
//   ) {

//     let notifications:[Notification]|[] = [];

//     const expiresAt = createDto.expiresAt
//       ? new Date(createDto.expiresAt)
//       : null;

//     if (createDto.userId) {

//       notifications =
//           [this.notificationRepository.create({
//           user: {
//             id: createDto.userId,
//           },

//           title: createDto.title,

//           message: createDto.message,

//           type: createDto.type ?? null,

//           url: createDto.url ?? null,

//           data: createDto.data ?? null,

//           is_read: false,

//           expires_at: expiresAt,
//         })]

//     } else {

//       const users = await this.usersService.getUsersbyRoles([Role.USER])


//         users.forEach(user => {

//         let notif = await this.notificationRepository.create({
//         user: {
//           id: user.id,
//         },
//         title: createDto.title,

//         message: createDto.message,

//         type: createDto.type ?? null,

//         url: createDto.url ?? null,

//         data: createDto.data ?? null,

//         is_read: false,

//         expires_at: expiresAt,
//       });

//         notifications.push(notif) 


//         });



//     }

//     this.notificationsGateway.sendToAll()
//     const saved =
//       await this.notificationRepository.save(
//         notification,
//       );

//     this.notificationsGateway.sendToUser(
//       userId,
//       {
//         id: saved.id,
//         title: saved.title,
//         message: saved.message,
//         type: saved.type,
//         url: saved.url,
//         data: saved.data,
//         is_read: saved.is_read,
//         created_at: saved.created_at,
//         expires_at: saved.expires_at,
//       },
//     );

//     return saved;
//   }

//   async createForAll(
//     createDto: CreateNotificationDto,
//   ) {
//     const users = await this.notificationRepository
//       .manager
//       .getRepository('User')
//       .find();

//     const notifications: Notification[] = [];

//     for (const user of users) {
//       const notification =
//         this.notificationRepository.create({
//           user: {
//             id: user.id,
//           },

//           title: createDto.title,

//           message: createDto.message,

//           type: createDto.type ?? null,

//           url: createDto.url ?? null,

//           data: createDto.data ?? null,

//           is_read: false,

//           expires_at: createDto.expiresAt
//             ? new Date(createDto.expiresAt)
//             : null,
//         });

//       notifications.push(notification);
//     }

//     const saved =
//       await this.notificationRepository.save(
//         notifications,
//       );

//     this.notificationsGateway.sendToAll({
//       title: createDto.title,
//       message: createDto.message,
//       type: createDto.type ?? null,
//       url: createDto.url ?? null,
//       data: createDto.data ?? null,
//       is_read: false,
//     });

//     return saved;
//   }

//   async findAllForUser(
//     userId: string,
//   ) {
//     return this.notificationRepository.find({
//       where: {
//         user: {
//           id: userId,
//         },
//       },

//       order: {
//         created_at: 'DESC',
//       },
//     });
//   }

//   async markAllAsRead(
//     userId: string,
//   ) {
//     const notification =
//       await this.notificationRepository.findOne({
//         where: {
//           user: {
//             id: userId,
//           },
//         },
//       });

//     if (!notification) {
//       throw new NotFoundException(
//         'الإشعارات غير موجودة',
//       );
//     }

//     notification.is_read = true;

//     return this.notificationRepository.save(
//       notification,
//     );

//   }

//   async markAsRead(
//     id: string,
//     userId: string,
//   ) {
//     const notification =
//       await this.notificationRepository.findOne({
//         where: {
//           id,
//           user: {
//             id: userId,
//           },
//         },
//       });

//     if (!notification) {
//       throw new NotFoundException(
//         'الإشعار غير موجود',
//       );
//     }

//     notification.is_read = true;

//     return this.notificationRepository.save(
//       notification,
//     );
//   }



//   async delete(
//     id: string,
//     userId: string,
//   ) {
//     const notification =
//       await this.notificationRepository.findOne({
//         where: {
//           id,
//           user: {
//             id: userId,
//           },
//         },
//       });

//     if (!notification) {
//       throw new NotFoundException(
//         'الإشعار غير موجود',
//       );
//     }

//     await this.notificationRepository.remove(
//       notification,
//     );

//     return {
//       success: true,
//     };
//   }

//   async deleteExpired() {
//     const now = new Date();

//     const result =
//       await this.notificationRepository.delete({
//         expires_at: LessThan(now),
//       });

//     return {
//       deleted: result.affected ?? 0,
//     };
//   }
// }





import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from './notifications.gateway';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/auth/enums/role.enum';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {

  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly usersService: UsersService,
    private readonly notificationsGateway: NotificationsGateway,
  ) { }

  /**
   * Creates a notification for a single user or broadcasts to all.
   */
  // async create(createDto: CreateNotificationDto) {
  //   const expiresAt = createDto.expiresAt ? new Date(createDto.expiresAt) : null;

  //   // 1. Handle Single User Notification
  //   if (createDto.user_email) {

  //    const user = await this.usersService.findByQuery({email:createDto.user_email})

  //     const notification = this.notificationRepository.create({
  //       user: { id: user?.id },
  //       title: createDto.title,
  //       message: createDto.message,
  //       type: createDto.type ?? null,
  //       url: createDto.url ?? null,
  //       data: createDto.data ?? null,
  //       is_read: false,
  //       expires_at: expiresAt,
  //     });

  //     const saved = await this.notificationRepository.save(notification);

  //     this.notificationsGateway.sendToUser(user?.id!, saved);
  //     return saved;
  //   }

  //   // 2. Handle Broadcast (All Users)
  //   // NOTE: If user base is > 5,000, we must replace this with a batch/chunking job, 
  //   // or run a raw SQL INSERT INTO ... SELECT query to prevent memory exhaustion.
  //   const users = await this.usersService.getUsersbyRoles([Role.USER]);

  //   const notifications = users.map(user =>
  //     this.notificationRepository.create({
  //       user: { id: user.id },
  //       title: createDto.title,
  //       message: createDto.message,
  //       type: createDto.type ?? null,
  //       url: createDto.url ?? null,
  //       data: createDto.data ?? null,
  //       is_read: false,
  //       expires_at: expiresAt,
  //     })
  //   );

  //   // Save in chunks to prevent database parameter limits
  //   const saved = await this.notificationRepository.save(notifications, { chunk: 500 });




  //   users.map((user)=>
  //     this.notificationsGateway.sendToUser(user.id,{
  //       id: saved.find((notif)=> notif.user.id === user.id ? notif.id : null), 
  //       title: createDto.title,
  //       message: createDto.message,
  //       type: createDto.type!,
  //       url: createDto.url ?? null,
  //       data: createDto.data ,
  //       is_read: false,
  //     })
  //   )

  //   return saved;
  // }


 

  async create(createDto: CreateNotificationDto) {
    const expiresAt = createDto.expiresAt ? new Date(createDto.expiresAt) : null;

    // 1. Handle Single User Notification
    if (createDto.user_email) {
      const user = await this.usersService.findByQuery({ email: createDto.user_email });

      const notification = this.notificationRepository.create({
        user: { id: user?.id },
        title: createDto.title,
        message: createDto.message,
        type: createDto.type ?? null,
        url: createDto.url ?? null,
        data: createDto.data ?? null,
        is_read: false,
        expires_at: expiresAt,
      });

      const saved = await this.notificationRepository.save(notification);

      this.notificationsGateway.sendToUser(user?.id!, saved);
      return saved;
    }

    // 2. Handle Broadcast (All Users)
    const users = await this.usersService.getUsersbyRoles([Role.USER]);

    const notifications = users.map((user) =>
      this.notificationRepository.create({
        user: { id: user.id },
        title: createDto.title,
        message: createDto.message,
        type: createDto.type ?? null,
        url: createDto.url ?? null,
        data: createDto.data ?? null,
        is_read: false,
        expires_at: expiresAt,
      }),
    );

    // Save in chunks to prevent database parameter limits
    const saved = await this.notificationRepository.save(notifications, { chunk: 500 });

    // Broadcast via Socket
    users.forEach((user) => {
      // Find the saved notification matching the current user's ID
      const userNotif = saved.find((notif) => notif.user?.id === user.id);

      if (userNotif) {
        this.notificationsGateway.sendToUser(user.id, {
          id: userNotif.id, // <--- Correctly passing only the string ID
          title: createDto.title,
          message: createDto.message,
          type: createDto.type ?? null,
          url: createDto.url ?? null,
          data: createDto.data ?? null,
          is_read: false,
        });
      }
    });

    return saved;
  }

  async findAllForUser(userId: string) {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Efficiently updates all unread notifications to read using a single DB query.
   * No SELECT required.
   */
  async markAllAsRead(userId: string) {
    const result = await this.notificationRepository.update(
      { user: { id: userId }, is_read: false },
      { is_read: true }
    );

    if (result.affected === 0) {
      throw new NotFoundException('لا توجد إشعارات غير مقروءة'); // No unread notifications found
    }

    return { success: true, updated: result.affected };
  }

  async markAsRead(id: string, userId: string) {
    // Update directly without fetching first. It's faster.
    const result = await this.notificationRepository.update(
      { id, user: { id: userId } },
      { is_read: true }
    );

    if (result.affected === 0) {
      throw new NotFoundException('الإشعار غير موجود'); // Notification not found
    }

    return { success: true };
  }

  async delete(id: string, userId: string) {
    const result = await this.notificationRepository.delete({
      id,
      user: { id: userId },
    });

    if (result.affected === 0) {
      throw new NotFoundException('الإشعار غير موجود');
    }

    return { success: true };
  }

  async deleteExpired() {
    const result = await this.notificationRepository.delete({
      expires_at: LessThan(new Date()),
    });

    return { deleted: result.affected ?? 0 };
  }



  async deleteOldAndExpiredNotifications() {
    const now = new Date();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // This executes: DELETE FROM notifications WHERE expires_at < NOW() OR created_at < 7_DAYS_AGO
    const result = await this.notificationRepository.delete([
      { expires_at: LessThan(now) },
      { created_at: LessThan(oneWeekAgo) }
    ]);

    return result.affected ?? 0;
  }


  /**
   * Runs automatically every day at midnight (00:00).
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronCleanup() {
    this.logger.log('Starting automated notification cleanup...');

    try {
      const deletedCount = await this.deleteOldAndExpiredNotifications();
      this.logger.log(`Cleanup complete. Deleted ${deletedCount} old/expired notifications.`);
    } catch (error) {
      this.logger.error('Failed to clean up notifications', error);
    }
  }


}