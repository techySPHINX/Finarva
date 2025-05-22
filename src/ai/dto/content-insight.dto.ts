import { ApiProperty } from '@nestjs/swagger';
import { AnalyzeProfileDto } from './analyze-profile.dto';

export class ContentInsightDto {
  @ApiProperty({ description: 'Client profile object for learning content analysis' })
  clientProfile!: AnalyzeProfileDto;

  @ApiProperty({ description: 'Learning content engagement stats for analysis' })
  learningData!: {
    viewedContentIds: string[];
    completedContentIds: string[];
    engagementScore?: number;
  };
}
