import { IsString, IsArray, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitQuizDto {
  @ApiProperty({ description: 'The unique identifier of the quiz' })
  @IsString()
  @IsNotEmpty()
  quizId!: string;

  @ApiProperty({ description: 'Array of answers submitted by the user', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  answers!: string[];

  @ApiProperty({ description: 'Score achieved by the user' })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  score!: number;
}
