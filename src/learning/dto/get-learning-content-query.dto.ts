import { IsString, IsOptional, IsArray } from "class-validator";

export class GetLearningContentQueryDto {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

