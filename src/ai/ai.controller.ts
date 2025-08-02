import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  HttpException,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
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
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  private mapAnalyzeToClientProfile(
    analyze: AnalyzeProfileDto,
  ): ClientProfileDto {
    if (!analyze) {
      throw new BadRequestException('Invalid client profile data');
    }
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
  @ApiBody({ type: QuizSuggestionDto })
  @ApiResponse({ status: 200, description: 'Quiz questions generated' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 502, description: 'AI service unavailable' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generateQuizQuestions(
    @Body() dto: QuizSuggestionDto,
  ): Promise<string[]> {
    try {
      if (!dto?.clientProfile) {
        throw new BadRequestException('clientProfile is required');
      }
      const clientProfile = this.mapAnalyzeToClientProfile(dto.clientProfile);
      return await this.aiService.generateQuizSuggestions(clientProfile);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Quiz suggestions failed: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Quiz suggestions failed: Unknown error', String(error));
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to generate quiz questions',
      );
    }
  }

  @Post('content-insights')
  @ApiOperation({ summary: 'Analyze learning content engagement for a client' })
  @ApiBody({ type: ContentInsightDto })
  @ApiResponse({ status: 200, description: 'Content insights generated' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 502, description: 'AI service unavailable' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async analyzeLearningContent(
    @Body() dto: ContentInsightDto,
  ): Promise<string> {
    try {
      if (!dto?.clientProfile) {
        throw new BadRequestException('clientProfile is required');
      }
      if (!dto.learningData || Object.keys(dto.learningData).length === 0) {
        throw new BadRequestException('learningData is required');
      }
      const clientProfile = this.mapAnalyzeToClientProfile(dto.clientProfile);
      return await this.aiService.analyzeLearningContent(
        clientProfile,
        dto.learningData,
      );
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Content insights failed: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Content insights failed: Unknown error', String(error));
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to analyze content');
    }
  }

  @Post('investment-suggestions')
  @ApiOperation({
    summary: 'Suggest investment strategies based on client profile',
  })
  @ApiBody({ type: InvestmentSuggestionDto })
  @ApiResponse({ status: 200, description: 'Investment suggestions generated' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 502, description: 'AI service unavailable' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async suggestInvestments(
    @Body() dto: InvestmentSuggestionDto,
  ): Promise<string> {
    try {
      if (!dto?.clientProfile) {
        throw new BadRequestException('clientProfile is required');
      }
      const clientProfile = this.mapAnalyzeToClientProfile(dto.clientProfile);
      return await this.aiService.suggestInvestments(clientProfile);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Investment suggestions failed: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Investment suggestions failed: Unknown error',
          String(error),
        );
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to generate investment suggestions',
      );
    }
  }

  @Post('insurance-suggestions')
  @ApiOperation({ summary: 'Suggest insurance plans based on client profile' })
  @ApiBody({ type: InsuranceSuggestionDto })
  @ApiResponse({ status: 200, description: 'Insurance suggestions generated' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 502, description: 'AI service unavailable' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async suggestInsurance(@Body() dto: InsuranceSuggestionDto): Promise<string> {
    try {
      if (!dto?.clientProfile) {
        throw new BadRequestException('clientProfile is required');
      }
      const clientProfile = this.mapAnalyzeToClientProfile(dto.clientProfile);
      return await this.aiService.suggestInsurance(clientProfile);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Insurance suggestions failed: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Insurance suggestions failed: Unknown error',
          String(error),
        );
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to generate insurance suggestions',
      );
    }
  }

  @Post('financial-advice')
  @ApiOperation({ summary: 'Generate financial advice based on user data' })
  @ApiBody({ type: Object }) // Replace with a specific DTO
  @ApiResponse({ status: 200, description: 'Financial advice generated' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 502, description: 'AI service unavailable' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generateFinancialAdvice(@Body() financialData: any): Promise<string> {
    try {
      if (!financialData) {
        throw new BadRequestException('Financial data is required');
      }
      return await this.aiService.generateFinancialAdvice(financialData);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Financial advice failed: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Financial advice failed: Unknown error', String(error));
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to generate financial advice',
      );
    }
  }
}
