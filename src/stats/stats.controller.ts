import { Controller, Get, Param } from '@nestjs/common';
import { StatsService } from './stats.service';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthType } from 'src/auth/enums/auth.types.enum';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /** Full dashboard payload — used by both public and private dashboards */
  @Auth(AuthType.None)
  @Get('dashboard')
  getDashboard() {
    return this.statsService.getDashboardStats();
  }

  /** Quick counts only — lightweight */
  @Auth(AuthType.None)
  @Get('counts')
  getCounts() {
    return this.statsService.getGlobalCounts();
  }

  /** Seller-specific dashboard */
  @Auth(AuthType.None)
  @Get('seller/:sellerId')
  getSellerDashboard(@Param('sellerId') sellerId: number) {
    return this.statsService.getSellerDashboard(+sellerId);
  }
}
