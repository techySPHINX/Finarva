import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class ClientInvestmentProfileDto {
  @IsString()
  clientId!: string;

  @IsNumber()
  totalInvestmentAmount!: number;

  @IsNumber()
  activeInvestmentsCount!: number;

  @IsNumber()
  maturedInvestmentsCount!: number;

  @IsNumber()
  withdrawnInvestmentsCount!: number;

  @IsArray()
  @IsOptional()
  investmentTypes?: string[]; // e.g., ['Small Cap', 'Gold', 'Stocks']

  @IsOptional()
  @IsString()
  riskProfile?: string; // e.g., 'Conservative', 'Aggressive'

  @IsOptional()
  @IsNumber()
  averageReturns?: number; // Average returns percentage
}
