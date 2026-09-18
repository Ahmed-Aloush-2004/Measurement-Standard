import { Module } from '@nestjs/common';
import { ExamTypesService } from './exam-types.service';
import { ExamTypesController } from './exam-types.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [ExamTypesController],
  providers: [ExamTypesService],
  exports: [ExamTypesService], // تصديره إذا احتجنا استخدامه في موديول آخر
})
export class ExamTypesModule {}
