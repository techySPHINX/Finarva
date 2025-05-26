import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class UpdateInvestmentDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  returns?: number;

  @IsOptional()
  @IsString()
  source?: string;
}
