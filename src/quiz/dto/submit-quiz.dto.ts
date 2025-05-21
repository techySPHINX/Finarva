import { IsString, IsArray, IsNumber } from 'class-validator';

export class SubmitQuizDto {
  @IsString()
  quizId!: string;

  @IsArray()
  answers!: string[];

  @IsNumber()
  score!: number;
}
