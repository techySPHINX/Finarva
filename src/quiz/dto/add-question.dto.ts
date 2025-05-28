import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddQuestionDto {
  @ApiProperty({ description: 'ID of the quiz', example: 'quiz123' })
  @IsString()
  quizId!: string;

  @ApiProperty({ description: 'The question text', example: 'What is the capital of France?' })
  @IsString()
  question!: string;

  @ApiProperty({ description: 'List of possible options', example: ['Paris', 'London', 'Berlin', 'Madrid'], type: [String] })
  @IsArray()
  options!: string[];

  @ApiProperty({ description: 'The correct answer', example: 'Paris' })
  @IsString()
  answer!: string;

  @ApiProperty({ description: 'Language of the question', example: 'en' })
  @IsString()
  language!: string;
}

