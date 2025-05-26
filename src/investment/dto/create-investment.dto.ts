import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateInvestmentDto {
  @IsString()
  clientId!: string;

  @IsString()
  type!: string;  // e.g., "Small Cap", "Gold", "Stocks"

  @IsNumber()
  amount!: number;

  @IsDateString()
  startDate!: string;

  @IsString()
  status!: string;  // e.g., "active", "matured", "withdrawn"

  @IsOptional()
  @IsNumber()
  returns?: number;

  @IsOptional()
  @IsString()
  source?: string; // e.g., "PartnerAPI", "Manual"
}
