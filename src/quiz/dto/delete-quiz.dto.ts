import { IsString } from 'class-validator';

export class DeleteQuizDto {
  @IsString()
  id!: string;
}
