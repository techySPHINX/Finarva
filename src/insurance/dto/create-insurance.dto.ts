import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInsuranceDto {
  @ApiProperty({ description: 'ID of the client' })
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @ApiProperty({ description: 'Type of insurance' })
  @IsString()
  type!: string;

  @ApiProperty({ description: 'Insurance amount' })
  @IsNumber()
  amount!: number;

  @ApiProperty({ description: 'Premium amount' })
  @IsNumber()
  premium!: number;

  @ApiProperty({ description: 'Term in months' })
  @IsNumber()
  termMonths!: number;

  @ApiPropertyOptional({ description: 'Insurance provider' })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional({ description: 'Source of insurance' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({
    description: 'Start date of insurance',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({
    description: 'End date of insurance',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @ApiProperty({ description: 'Status of insurance' })
  @IsString()
  @IsNotEmpty()
  status!: string;
}
