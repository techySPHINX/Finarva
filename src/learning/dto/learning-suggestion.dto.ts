import { IsArray, IsString, IsOptional, IsObject } from "class-validator";

export class LearningSuggestionDto {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsObject()
  profile?: {
    name?: string;
    age?: number;
    occupation?: string;
    investmentExperience?: string;
  };

  @IsOptional()
  learningHistory?: {
    contentId: string;
    completion: number;
    viewedAt: Date;
  }[];
}

