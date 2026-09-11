import { Controller, Get, Body, Patch, Req, UseGuards } from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('user-progress')
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @UseGuards(AuthGuard('jwt'))  
  @Get()
  getProgress(@Req() req: any) {
    // نجلب تقدم المستخدم الحالي بناءً على التوكن الخاص به
    return this.userProgressService.getProgress(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))  
  @Patch()
  updateProgress(@Req() req: any, @Body() updateDto: UpdateUserProgressDto) {
    return this.userProgressService.updateProgress(req.user.userId, updateDto);
  }
}