import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInvestmentDto {
  @ApiPropertyOptional({ description: 'Type of the investment (e.g., mutual fund, stock)' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Updated amount for the investment', example: 100000 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'New start date of the investment', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Updated status of the investment (e.g., active, matured, withdrawn)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Updated return amount from the investment', example: 15000 })
  @IsOptional()
  @IsNumber()
  returns?: number;

  @ApiPropertyOptional({ description: 'Updated source or platform of the investment' })
  @IsOptional()
  @IsString()
  source?: string;
}
