import { ApiProperty } from '@nestjs/swagger';

export class ClientAiInsightsDto {
  @ApiProperty({
    example: [
      'Create a quiz about saving habits',
      'Send content on digital payments',
    ],
  })
  quizSuggestions!: string[];

  @ApiProperty({ example: ['Add learning content on financial literacy'] })
  contentSuggestions!: string[];

  @ApiProperty({
    example: ['Mutual funds for beginners', 'Micro insurance plans'],
  })
  investmentSuggestions!: string[];
}
