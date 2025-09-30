import { Controller, Post, Body, Get, Request, Param, Res, UseGuards } from '@nestjs/common';
import { TaxService } from './tax.service';
import { CalculateTaxDto } from './dto/calculate-tax.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tax')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) { }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate taxes' })
  @ApiResponse({ status: 201, description: 'The tax has been successfully calculated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  calculate(@Body() calculateTaxDto: CalculateTaxDto, @Request() req: any) {
    const userId = req.user.id;
    return this.taxService.calculate(calculateTaxDto, userId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get tax history for the current user' })
  @ApiResponse({ status: 200, description: 'Return tax history.' })
  getHistory(@Request() req: any) {
    const userId = req.user.id;
    return this.taxService.getHistory(userId);
  }

  @Get('report/:year')
  @ApiOperation({ summary: 'Generate a tax report for a given year' })
  @ApiResponse({ status: 200, description: 'Return a PDF tax report.' })
  @ApiResponse({ status: 404, description: 'Tax data not found.' })
  async generateReport(
    @Request() req: any,
    @Param('year') year: number,
    @Res() res: Response,
  ) {
    const userId = req.user.id;
    const pdfBuffer = await this.taxService.generateTaxReport(userId, year);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=tax-report-${year}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
