import {
  Controller,
  Get,
  Headers,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

// Triggered by Vercel Cron Jobs (see vercel.json -> "crons").
// Vercel functions don't run continuously, so the in-process
// @Cron() job in NotificationsService only runs when NOT deployed
// on Vercel (see app.module.ts). On Vercel, this HTTP endpoint is
// hit on a schedule instead and does the same cleanup.
@Controller('cron')
export class CronController {
  private readonly logger = new Logger(CronController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('cleanup-notifications')
  async cleanupNotifications(@Headers('authorization') authorization?: string) {
    if (
      !process.env.CRON_SECRET ||
      authorization !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      throw new UnauthorizedException();
    }

    const deletedCount =
      await this.notificationsService.deleteOldAndExpiredNotifications();
    this.logger.log(`Cron cleanup complete. Deleted ${deletedCount} notifications.`);

    return { ok: true, deleted: deletedCount };
  }
}
