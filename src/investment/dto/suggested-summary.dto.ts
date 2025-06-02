import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SuggestSummaryDto {
  @ApiProperty({ description: 'ID of the client receiving the suggestion' })
  @IsString()
  clientId!: string;

  @ApiProperty({
    description: 'Type of suggestion (e.g., quiz, learning, investment)',
  })
  @IsString()
  type!: string;

  @ApiProperty({ description: 'Text content of the suggestion' })
  @IsString()
  suggestion!: string;

  @ApiPropertyOptional({
    description: 'Optional metadata associated with the suggestion',
    type: 'object',
    additionalProperties: true,
    example: { source: 'AI Engine', topic: 'Mutual Funds' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, never>;

  @ApiPropertyOptional({
    description:
      'Optional confidence score (0 to 1) indicating suggestion reliability',
    example: 0.85,
  })
  @IsOptional()
  @IsNumber()
  confidence?: number;
}
