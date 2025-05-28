import { IsString, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddQuestionDto {
  @ApiProperty({
    description: 'ID of the quiz to which this question belongs',
    example: 'quiz123',
  })
  @IsString()
  @IsNotEmpty()
  readonly quizId!: string;

  @ApiProperty({
    description: 'The actual question text',
    example: 'What is the capital of France?',
  })
  @IsString()
  @IsNotEmpty()
  readonly question!: string;

  @ApiProperty({
    description: 'List of possible options',
    example: ['Paris', 'London', 'Berlin', 'Madrid'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  readonly options!: string[];

  @ApiProperty({
    description: 'The correct answer from the options',
    example: 'Paris',
  })
  @IsString()
  @IsNotEmpty()
  readonly answer!: string;

  @ApiProperty({
    description: 'Language of the question',
    example: 'en',
  })
  @IsString()
  @IsNotEmpty()
  readonly language!: string;
}
