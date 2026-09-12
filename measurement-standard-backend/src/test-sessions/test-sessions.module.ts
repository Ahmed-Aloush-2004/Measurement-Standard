import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestSessionsService } from './test-sessions.service';
import { TestSessionsController } from './test-sessions.controller';
import { TestSession } from './entities/test-session.entity';
import { Question } from '../questions/entities/question.entity';
import { UserResponse } from '../user-responses/entities/user-response.entity';
import { UserProgress } from '../user-progress/entities/user-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestSession, Question, UserResponse, UserProgress]),
  ],
  controllers: [TestSessionsController],
  providers: [TestSessionsService],
  exports: [TestSessionsService],
})
export class TestSessionsModule {}