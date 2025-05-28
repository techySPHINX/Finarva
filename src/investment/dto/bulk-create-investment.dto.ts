import { IsString, IsNumber, IsDateString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateInvestmentItemDto {
  @ApiProperty({ description: 'Client ID' })
  @IsString()
  clientId!: string;

  @ApiProperty({ description: 'Investment type, e.g., "Small Cap", "Gold", etc.' })
  @IsString()
  type!: string;

  @ApiProperty({ description: 'Investment amount' })
  @IsNumber()
  amount!: number;

  @ApiProperty({ description: 'Investment start date', type: String, format: 'date-time' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ description: 'Investment status, e.g., "active", "matured", "withdrawn"' })
  @IsString()
  status!: string;

  @ApiPropertyOptional({ description: 'Returns on investment' })
  @IsOptional()
  @IsNumber()
  returns?: number;

  @ApiPropertyOptional({ description: 'Source of investment, e.g., "PartnerAPI", "Manual"' })
  @IsOptional()
  @IsString()
  source?: string;
}

export class BulkCreateInvestmentDto {
  @ApiProperty({
    type: [CreateInvestmentItemDto],
    description: 'Array of investments to create'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvestmentItemDto)
  investments: CreateInvestmentItemDto[] | undefined;
}
