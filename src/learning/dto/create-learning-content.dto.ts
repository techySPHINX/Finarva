import { IsString, IsArray } from 'class-validator';

export class CreateLearningContentDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  type!: 'video' | 'audio' | 'pdf';

  @IsString()
  url!: string;

  @IsString()
  language!: string;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];
}
