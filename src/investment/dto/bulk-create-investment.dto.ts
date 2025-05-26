import { IsString, IsNumber, IsDateString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateInvestmentItemDto {
  @IsString()
  clientId!: string;

  @IsString()
  type!: string; // e.g., "Small Cap", "Gold", etc.

  @IsNumber()
  amount!: number;

  @IsDateString()
  startDate!: string;

  @IsString()
  status!: string; // e.g., "active", "matured", "withdrawn"

  @IsOptional()
  @IsNumber()
  returns?: number;

  @IsOptional()
  @IsString()
  source?: string; // e.g., "PartnerAPI", "Manual"
}

export class BulkCreateInvestmentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvestmentItemDto)
  investments: CreateInvestmentItemDto[] | undefined;
}
