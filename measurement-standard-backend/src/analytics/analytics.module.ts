import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { User } from 'src/users/entities/user.entity';
import { ExamType } from 'src/exam-types/entities/exam-type.entity';
import { Question } from 'src/questions/entities/question.entity';
import { Section } from 'src/sections/entities/section.entity';
import { AnalyticsService } from './analytics.service';


@Module({
  imports: [TypeOrmModule.forFeature([User,ExamType,Section,Question])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
