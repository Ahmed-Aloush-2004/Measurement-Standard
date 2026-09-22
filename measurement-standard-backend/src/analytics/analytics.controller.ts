import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';
import { Role } from '../auth/enums/role.enum';
import { AuthGuard } from '@nestjs/passport';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsServicetsts: AnalyticsService) {}

  @Get('dashboard')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getDashboardStats() {
    return this.analyticsServicetsts.getDashboardStats();
  }
}
