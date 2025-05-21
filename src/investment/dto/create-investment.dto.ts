import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateInvestmentDto {
  @IsString()
  clientId!: string;

  @IsString()
  type!: string;

  @IsNumber()
  amount!: number;

  @IsDateString()
  startDate!: string;

  @IsString()
  status!: string; // "active", "matured", etc.

  @IsOptional()
  @IsNumber()
  returns?: number;

  @IsOptional()
  @IsString()
  source?: string;
}
