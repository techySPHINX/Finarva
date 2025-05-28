import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterInvestmentDto {
  @ApiPropertyOptional({
    description: 'Filter investments by client ID',
    example: '60f5a3e9e1d2c9001c9b2b3e',
  })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Filter by investment type',
    example: 'Gold',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Filter by investment status',
    example: 'active',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by associated tags',
    type: [String],
    example: ['long-term', 'tax-saving'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
