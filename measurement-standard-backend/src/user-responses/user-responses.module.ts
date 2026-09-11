import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserResponsesService } from './user-responses.service';
import { UserResponsesController } from './user-responses.controller';
import { UserResponse } from './entities/user-response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserResponse])],
  controllers: [UserResponsesController],
  providers: [UserResponsesService],
  exports: [UserResponsesService],
})
export class UserResponsesModule {}