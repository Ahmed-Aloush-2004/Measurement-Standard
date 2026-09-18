import { Module } from '@nestjs/common';
import { UserResponsesService } from './user-responses.service';
import { UserResponsesController } from './user-responses.controller';

@Module({
  controllers: [UserResponsesController],
  providers: [UserResponsesService],
  exports: [UserResponsesService],
})
export class UserResponsesModule {}
