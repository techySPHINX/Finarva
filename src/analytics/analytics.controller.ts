
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('analytics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('financial-summary')
  @ApiOperation({ summary: 'Get a financial summary' })
  @ApiResponse({ status: 200, description: 'Return a financial summary.' })
  getFinancialSummary(@Request() req: any) {
    const userId = req.user.id;
    return this.analyticsService.getFinancialSummary(userId);
  }

  @Get('sales-analytics')
  @ApiOperation({ summary: 'Get sales analytics' })
  @ApiResponse({ status: 200, description: 'Return sales analytics.' })
  getSalesAnalytics(@Request() req: any) {
    const userId = req.user.id;
    return this.analyticsService.getSalesAnalytics(userId);
  }
}
