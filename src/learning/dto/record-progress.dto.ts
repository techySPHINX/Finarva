import { IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecordProgressDto {
  @ApiProperty({ description: 'ID of the client', example: 'client123' })
  @IsString()
  clientId!: string;

  @ApiProperty({ description: 'ID of the content', example: 'content456' })
  @IsString()
  contentId!: string;

  @ApiProperty({
    description: 'Completion percentage',
    minimum: 0,
    maximum: 100,
    example: 75,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  completion!: number;

  @ApiProperty({
    description: 'Additional progress data',
    example: { step: 2, status: 'in-progress' },
    required: false,
  })
  progress?: {
    step: number;
    status: string;
    [key: string]: unknown;
  };
}
