import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestSessionsService } from './test-sessions.service';
import { TestSessionsController } from './test-sessions.controller';
import { TestSession } from './entities/test-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestSession])],
  controllers: [TestSessionsController],
  providers: [TestSessionsService],
  exports: [TestSessionsService],
})
export class TestSessionsModule {}