import { IsString, IsArray, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({ description: 'Title of the quiz' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Description of the quiz', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Language of the quiz' })
  @IsString()
  @IsNotEmpty()
  language!: string;

  @ApiProperty({
    description: 'Tags associated with the quiz',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
