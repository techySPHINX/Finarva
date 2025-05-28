import { IsString, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitQuizDto {
  @ApiProperty({ description: 'The unique identifier of the quiz' })
  @IsString()
  quizId!: string;

  @ApiProperty({ description: 'Array of answers submitted by the user', type: [String] })
  @IsArray()
  answers!: string[];

  @ApiProperty({ description: 'Score achieved by the user' })
  @IsNumber()
  score!: number;
}
