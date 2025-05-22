import { IsOptional, IsString, IsInt, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzeProfileDto {
  @ApiPropertyOptional({ description: 'Age of the client' })
  @IsOptional()
  @IsInt()
  age?: number;

  @ApiPropertyOptional({ description: 'Monthly or yearly income of client' })
  @IsOptional()
  @IsNumber()
  income?: number;

  @ApiPropertyOptional({ description: 'Primary language code (e.g. en, hi, ta)' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Client financial or personal goals' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];

  @ApiPropertyOptional({ description: 'Gender of the client' })
  @IsOptional()
  @IsString()
  gender?: string;
}
