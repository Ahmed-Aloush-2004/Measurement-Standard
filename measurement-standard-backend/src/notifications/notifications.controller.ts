import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { NotificationsService } from './notifications.service';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // --------------------------------------------------
  // SEND A NOTIFICATIONS FOR ALL USERS
  // --------------------------------------------------

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('all-user')
  sendNotificationForAllUsers(
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationsService.create({
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      type: createNotificationDto.type,
      url: createNotificationDto.url,
    });
  }

  // --------------------------------------------------
  //  SEND A NOTIFICATION FOR A SPECIFICE USER
  // --------------------------------------------------

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  // --------------------------------------------------
  // GET USER NOTIFICATIONS
  // --------------------------------------------------

  @Get()
  findAll(@Req() req: any) {
    return this.notificationsService.findAllForUser(req.user.userId);
  }

  // --------------------------------------------------
  // MARK AS READ
  // --------------------------------------------------

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req: any) {
    console.log('this is the id : ', id);

    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  // Add inside notifications.controller.ts
  @Patch('read-all')
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.delete(id, req.user.userId);
  }
}
