import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserResponsesService } from './user-responses.service';
import { UserResponsesController } from './user-responses.controller';
import { UserResponse } from './entities/user-response.entity';
import { Choice } from '../choices/entities/choice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserResponse, Choice])],
  controllers: [UserResponsesController],
  providers: [UserResponsesService],
  exports: [UserResponsesService],
})
export class UserResponsesModule {}