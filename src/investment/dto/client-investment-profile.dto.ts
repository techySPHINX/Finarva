import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClientInvestmentProfileDto {
  @ApiProperty({ description: 'Unique identifier for the client' })
  @IsString()
  clientId!: string;

  @ApiProperty({ description: 'Total investment amount of the client', example: 100000 })
  @IsNumber()
  totalInvestmentAmount!: number;

  @ApiProperty({ description: 'Number of active investments', example: 3 })
  @IsNumber()
  activeInvestmentsCount!: number;

  @ApiProperty({ description: 'Number of matured investments', example: 2 })
  @IsNumber()
  maturedInvestmentsCount!: number;

  @ApiProperty({ description: 'Number of withdrawn investments', example: 1 })
  @IsNumber()
  withdrawnInvestmentsCount!: number;

  @ApiPropertyOptional({
    description: 'Types of investments',
    example: ['Small Cap', 'Gold', 'Stocks'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  investmentTypes?: string[];

  @ApiPropertyOptional({
    description: 'Risk profile of the client',
    example: 'Conservative',
  })
  @IsOptional()
  @IsString()
  riskProfile?: string;

  @ApiPropertyOptional({
    description: 'Average returns percentage',
    example: 7.5,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  averageReturns?: number;
}
