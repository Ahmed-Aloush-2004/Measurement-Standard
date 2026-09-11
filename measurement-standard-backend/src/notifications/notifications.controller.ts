import { Controller, Get, Post, Body, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Req() req: any, @Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(req.user.userId, createNotificationDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Req() req: any) {
    return this.notificationsService.findAllForUser(req.user.userId);
  }
  
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }
}