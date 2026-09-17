import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { Question } from './entities/question.entity';
import { UserResponse } from 'src/user-responses/entities/user-response.entity';
import { ChoicesModule } from 'src/choices/choices.module';
import { Choice } from 'src/choices/entities/choice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question,UserResponse,Choice]),
    
],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}