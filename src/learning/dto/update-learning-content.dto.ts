import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLearningContentDto {
  @ApiPropertyOptional({
    description: 'Title of the learning content',
    example: 'Introduction to TypeScript',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Description of the learning content',
    example: 'A beginner-friendly guide to TypeScript.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of the content',
    enum: ['video', 'audio', 'pdf'],
    example: 'video',
  })
  @IsOptional()
  @IsString()
  type?: 'video' | 'audio' | 'pdf';

  @ApiPropertyOptional({
    description: 'URL of the content',
    example: 'https://example.com/content.mp4',
  })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    description: 'Language of the content',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Tags for the content',
    type: [String],
    example: ['typescript', 'programming'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
