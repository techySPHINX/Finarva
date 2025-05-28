import { IsString, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({ description: 'Title of the quiz' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Description of the quiz', required: false })
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Language of the quiz' })
  @IsString()
  language!: string;

  @ApiProperty({ description: 'Tags associated with the quiz', type: [String] })
  @IsArray()
  tags!: string[];
}
