import {
  IsArray,
  IsString,
  IsOptional,
  IsObject,
  ValidateNested,
  IsNumber,
  IsDate,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type as TransformType } from 'class-transformer';

class LearningHistoryItem {
  @ApiPropertyOptional({ description: 'Content ID', example: 'abc123' })
  @IsString()
  contentId!: string;

  @ApiPropertyOptional({ description: 'Completion percentage', example: 100 })
  @IsNumber()
  completion!: number;

  @ApiPropertyOptional({
    description: 'Viewed at timestamp',
    example: '2024-06-01T12:00:00Z',
  })
  @IsDate()
  @TransformType(() => Date)
  viewedAt!: Date;
}

export class LearningSuggestionDto {
  @ApiPropertyOptional({ description: 'Preferred language', example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'User interests',
    type: [String],
    example: ['finance', 'technology'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiPropertyOptional({
    description: 'User profile information',
    type: 'object',
    additionalProperties: true,
    example: {
      name: 'John Doe',
      age: 30,
      occupation: 'Engineer',
      investmentExperience: 'Intermediate',
    },
  })
  @IsOptional()
  @IsObject()
  profile?: {
    name?: string;
    age?: number;
    occupation?: string;
    investmentExperience?: string;
  };

  @ApiPropertyOptional({
    description: 'Learning history',
    type: [LearningHistoryItem],
    example: [
      {
        contentId: 'abc123',
        completion: 100,
        viewedAt: '2024-06-01T12:00:00Z',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @TransformType(() => LearningHistoryItem)
  learningHistory?: LearningHistoryItem[];
}
