import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class SuggestSummaryDto {
  @IsString()
  clientId!: string;

  @IsString()
  type!: string; // e.g., "quiz", "learning", "investment"

  @IsString()
  suggestion!: string; 

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>; 

  @IsOptional()
  @IsNumber()
  confidence?: number; // Optional confidence value for the suggestion
}
