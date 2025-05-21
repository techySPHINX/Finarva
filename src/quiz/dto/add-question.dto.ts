import { IsString, IsArray } from 'class-validator';

export class AddQuestionDto {
  @IsString()
  quizId!: string;

  @IsString()
  question!: string;

  @IsArray()
  options!: string[];

  @IsString()
  answer!: string;

  @IsString()
  language!: string;
}
