import { ApiProperty } from '@nestjs/swagger';
import { AnalyzeProfileDto } from './analyze-profile.dto';

export class InvestmentSuggestionDto {
  @ApiProperty({ description: 'Client profile object for investment strategy suggestion' })
  clientProfile!: AnalyzeProfileDto;
}
