import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { ClientProfileDto } from '../clients/dto/client-profile.dto';
import { AnalyzeProfileDto } from './dto/analyze-profile.dto';

import { QuizSuggestionDto } from './dto/quiz-suggestion.dto';
import { InsuranceSuggestionDto } from './dto/insurance-suggestion.dto';
import { ContentInsightDto } from './dto/content-insight.dto';
import { InvestmentSuggestionDto } from './dto/investment-suggestion.dto';

@ApiTags('AI Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  private mapAnalyzeToClientProfile(
    analyze: AnalyzeProfileDto,
  ): ClientProfileDto {
    return {
      id: 'unknown-id',
      name: 'unknown-name',
      phone: 'unknown-phone',
      agentId: 'unknown-agent',
      language: analyze.language || 'unknown-language',
      goals: analyze.goals || [],
    };
  }

  @Post('quiz-suggestions')
  @ApiOperation({ summary: 'Generate quiz questions based on client profile' })
  async generateQuizQuestions(
    @Body() dto: QuizSuggestionDto,
  ): Promise<string[]> {
    const clientProfile = this.mapAnalyzeToClientProfile(dto.clientProfile);
    return this.aiService.generateQuizSuggestions(clientProfile);
  }

  @Post('content-insights')
  @ApiOperation({ summary: 'Analyze learning content engagement for a client' })
  async analyzeLearningContent(
    @Body() dto: ContentInsightDto,
  ): Promise<string> {
    const clientProfile = this.mapAnalyzeToClientProfile(dto.clientProfile);
    return this.aiService.analyzeLearningContent(
      clientProfile,
      dto.learningData,
    );
  }

  @Post('investment-suggestions')
  @ApiOperation({
    summary: 'Suggest investment strategies based on client profile',
  })
  async suggestInvestments(
    @Body() dto: InvestmentSuggestionDto,
  ): Promise<string> {
    const clientProfile = this.mapAnalyzeToClientProfile(dto.clientProfile);
    return this.aiService.suggestInvestments(clientProfile);
  }

  @Post('insurance-suggestions')
  @ApiOperation({ summary: 'Suggest insurance plans based on client profile' })
  async suggestInsurance(@Body() dto: InsuranceSuggestionDto): Promise<string> {
    const clientProfile = this.mapAnalyzeToClientProfile(dto.clientProfile);
    return this.aiService.suggestInsurance(clientProfile);
  }
}
