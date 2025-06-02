import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLearningContentDto {
  @ApiProperty({ example: 'Introduction to TypeScript' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'A beginner-friendly guide to TypeScript.' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'video', enum: ['video', 'audio', 'pdf'] })
  @IsString()
  type!: 'video' | 'audio' | 'pdf';

  @ApiProperty({ example: 'https://example.com/intro-to-ts.mp4' })
  @IsString()
  url!: string;

  @ApiProperty({ example: 'en' })
  @IsString()
  language!: string;

  @ApiProperty({
    example: ['typescript', 'beginner', 'programming'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  tags!: string[];
}
