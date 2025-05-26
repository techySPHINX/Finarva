import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateLearningContentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  type?: 'video' | 'audio' | 'pdf';

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
