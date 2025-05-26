import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class AiInvestmentInputDto {
  @IsString()
  clientId!: string;

  @IsOptional()
  @IsArray()
  investmentTypes?: string[];

  @IsOptional()
  @IsNumber()
  totalInvestmentAmount?: number;

  @IsOptional()
  @IsString()
  riskProfile?: string; // e.g., 'Conservative', 'Moderate', 'Aggressive'

  @IsOptional()
  @IsNumber()
  averageReturns?: number; 
  @IsOptional()
  @IsString()
  notes?: string; 
}
