import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsNotEmpty,
  ArrayNotEmpty,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional} from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ClientProfile {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Name of the client' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 30, description: 'Age of the client' })
  @IsOptional()
  age?: number;

  @ApiPropertyOptional({ example: 'Engineer', description: 'Occupation of the client' })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({ example: ['finance', 'technology'], type: [String], description: 'Interests of the client' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiPropertyOptional({ example: 'en', description: 'Preferred language' })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiPropertyOptional({ example: 'beginner', description: 'Investment experience level' })
  @IsOptional()
  @IsString()
  investmentExperience?: string;
}

export class QuizAttempt {
  @ApiPropertyOptional({ example: 'quiz123', description: 'Quiz ID' })
  @IsOptional()
  @IsString()
  quizId?: string;

  @ApiPropertyOptional({ example: 85, description: 'Score achieved in the quiz' })
  @IsOptional()
  score?: number;

  @ApiPropertyOptional({ example: '2024-06-01T12:00:00Z', description: 'Completion date of the quiz' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;
}

export class QuizSuggestionDto {
  @ApiPropertyOptional({ example: '663d24d2ef8301f8f9d182cd', description: 'Client ID' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ type: ClientProfile, description: 'Client profile details' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ClientProfile)
  profile?: ClientProfile;

  @ApiPropertyOptional({ type: [QuizAttempt], description: 'Quiz attempt history' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuizAttempt)
  quizHistory?: QuizAttempt[];

  @ApiPropertyOptional({
    example: ['investment', 'insurance'],
    type: [String],
    description: 'Tags related to the quiz suggestion',
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    example: 'en',
    description: 'Language for the quiz suggestion',
  })
  @IsOptional()
  @IsString()
  language?: string;
}
