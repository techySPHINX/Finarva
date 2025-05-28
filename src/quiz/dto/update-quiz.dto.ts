import { IsOptional, IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  tags?: string[];

  @IsOptional()
  @IsString()
  language?: string;
}
