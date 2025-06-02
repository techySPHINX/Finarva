import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiInvestmentInputDto {
  @ApiProperty({ description: 'Unique identifier for the client' })
  @IsString()
  clientId!: string;

  @ApiPropertyOptional({ description: 'Types of investments', type: [String] })
  @IsOptional()
  @IsArray()
  investmentTypes?: string[];

  @ApiPropertyOptional({
    description: 'Total investment amount',
    example: 10000,
  })
  @IsOptional()
  @IsNumber()
  totalInvestmentAmount?: number;

  @ApiPropertyOptional({
    description: 'Risk profile (e.g., Conservative, Moderate, Aggressive)',
  })
  @IsOptional()
  @IsString()
  riskProfile?: string;

  @ApiPropertyOptional({ description: 'Average returns', example: 7.5 })
  @IsOptional()
  @IsNumber()
  averageReturns?: number;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
