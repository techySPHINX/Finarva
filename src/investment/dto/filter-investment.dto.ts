import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class FilterInvestmentDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];  // if you want to filter by tags or categories
}
