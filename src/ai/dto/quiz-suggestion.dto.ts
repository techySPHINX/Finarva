import { ApiProperty } from '@nestjs/swagger';
import { AnalyzeProfileDto } from './analyze-profile.dto';

export class QuizSuggestionDto {
  @ApiProperty({
    description: 'Client profile object for quiz question generation',
  })
  clientProfile!: AnalyzeProfileDto;
}
