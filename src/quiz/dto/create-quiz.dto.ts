import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  language!: string;

  @IsArray()
  tags!: string[];
}
