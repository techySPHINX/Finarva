import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';

import { QuizSuggestionDto } from './dto/quiz-suggestion.dto';
import { ContentInsightDto } from './dto/content-insight.dto';
import { InvestmentSuggestionDto } from './dto/investment-suggestion.dto';

@ApiTags('AI Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('quiz-suggestions')
  @ApiOperation({ summary: 'Generate quiz questions based on client profile' })
  async generateQuizQuestions(@Body() dto: QuizSuggestionDto) {
    return this.aiService.generateQuizSuggestions(dto.clientProfile);
  }

  @Post('content-insights')
  @ApiOperation({ summary: 'Analyze learning content engagement for a client' })
  async analyzeLearningContent(@Body() dto: ContentInsightDto) {
    return this.aiService.analyzeLearningContent(dto.clientProfile, dto.learningData);
  }

  @Post('investment-suggestions')
  @ApiOperation({ summary: 'Suggest investment strategies based on client profile' })
  async suggestInvestments(@Body() dto: InvestmentSuggestionDto) {
    return this.aiService.suggestInvestments(dto.clientProfile);
  }
}
