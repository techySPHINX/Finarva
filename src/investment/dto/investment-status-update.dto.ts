import { IsString, IsOptional } from 'class-validator';

export class InvestmentStatusDto {
  @IsString()
  investmentId!: string;

  @IsString()
  status!: string; // e.g., "active", "matured", "withdrawn"

  @IsOptional()
  @IsString()
  remarks?: string; // Optional field for any additional notes or comments
}
