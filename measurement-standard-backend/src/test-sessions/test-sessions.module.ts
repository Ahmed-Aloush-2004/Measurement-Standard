import { Module } from '@nestjs/common';
import { TestSessionsService } from './test-sessions.service';
import { TestSessionsController } from './test-sessions.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [TestSessionsController],
  providers: [TestSessionsService],
  exports: [TestSessionsService],
})
export class TestSessionsModule {}
