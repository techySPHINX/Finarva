
import { Controller, Get, Query } from '@nestjs/common';
import { CashFlowService } from './cash-flow.service';

@Controller('cash-flow')
export class CashFlowController {
  constructor(private readonly cashFlowService: CashFlowService) {}

  @Get('analysis')
  getAnalysis(@Query('userId') userId: string) {
    return this.cashFlowService.analyze(userId);
  }

  @Get('forecast')
  getForecast(@Query('userId') userId: string) {
    return this.cashFlowService.forecast(userId);
  }
}
