import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLearningDto {
  @ApiProperty({ example: 'Basics of Insurance', description: 'Title of the learning content' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'A short guide on insurance basics', description: 'Description of the content' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'video', description: 'Type of content: video, audio, pdf' })
  @IsString()
  type!: string;

  @ApiProperty({ example: 'https://example.com/content/video1.mp4', description: 'URL of the content file' })
  @IsString()
  url!: string;

  @ApiProperty({ example: 'hi', description: 'Language code (e.g., en, hi, ta)' })
  @IsString()
  language!: string;

  @ApiPropertyOptional({ example: ['insurance', 'savings'], description: 'Tags or topics associated with content' })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
