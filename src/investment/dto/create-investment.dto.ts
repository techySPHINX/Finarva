import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvestmentDto {
  @ApiProperty({
    description: 'ID of the client associated with the investment',
    example: '60f5a3e9e1d2c9001c9b2b3e',
  })
  @IsString()
  clientId!: string;

  @ApiProperty({
    description: 'Type of investment',
    example: 'Small Cap',
  })
  @IsString()
  type!: string;

  @ApiProperty({
    description: 'Amount invested',
    example: 5000,
  })
  @IsNumber()
  amount!: number;

  @ApiProperty({
    description: 'Start date of the investment',
    type: String,
    format: 'date-time',
    example: '2024-06-01T00:00:00Z',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'Status of the investment',
    example: 'active',
  })
  @IsString()
  status!: string;

  @ApiPropertyOptional({
    description: 'Returns generated from the investment',
    example: 650.75,
  })
  @IsOptional()
  @IsNumber()
  returns?: number;

  @ApiPropertyOptional({
    description: 'Source of the investment entry (e.g., PartnerAPI, Manual)',
    example: 'PartnerAPI',
  })
  @IsOptional()
  @IsString()
  source?: string;
}
