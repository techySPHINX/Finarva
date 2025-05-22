import {
  IsString,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ClientProfile {
  @IsString()
  name?: string;

  @IsOptional()
  age?: number;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  investmentExperience?: string;
}

class QuizAttempt {
  @IsString()
  quizId?: string;

  @IsOptional()
  score?: number;

  @IsOptional()
  @IsDateString()
  completedAt?: string;
}

export class QuizSuggestionDto {
  @ApiPropertyOptional({ example: '663d24d2ef8301f8f9d182cd' })
  @IsOptional()
  @IsString()
  clientId?: string; // ✅ add this line

  @ApiPropertyOptional({ type: ClientProfile })
  @IsOptional()
  @ValidateNested()
  @Type(() => ClientProfile)
  profile?: ClientProfile;

  @ApiPropertyOptional({ type: [QuizAttempt] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuizAttempt)
  quizHistory?: QuizAttempt[];

  @ApiPropertyOptional({
    example: ['investment', 'insurance'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    example: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;
}
