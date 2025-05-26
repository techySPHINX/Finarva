import { IsString, IsNumber, Min, Max } from 'class-validator';

export class RecordProgressDto {
  @IsString()
  clientId!: string;

  @IsString()
  contentId!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  completion!: number;
  progress: any;
}
