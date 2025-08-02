
import { Controller, Get, Query } from '@nestjs/common';
import { ReportingService } from './reporting.service';

@Controller('reporting')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('summary')
  getSummary(@Query('userId') userId: string) {
    return this.reportingService.generateReport(userId);
  }
}
