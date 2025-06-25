import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { ClientProfileDto } from '../clients/dto/client-profile.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly endpoint: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

    if (!this.apiKey) {
      this.logger.error('GEMINI_API_KEY environment variable not set');
      throw new Error('AI service configuration error');
    }
  }

  private async callGeminiApi(
    prompt: string,
    maxTokens = 300,
  ): Promise<string> {
    if (!prompt || prompt.trim().length === 0) {
      throw new BadRequestException('Prompt cannot be empty');
    }

    try {
      const response = await axios.post(
        `${this.endpoint}?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: maxTokens },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000, // 10-second timeout
        },
      );

      const result: {
        candidates?: {
          content?: {
            parts?: { text?: string }[];
          };
        }[];
      } = response.data;

      if (!result.candidates || result.candidates.length === 0) {
        this.logger.warn('Gemini API returned empty candidates');
        return 'No response generated';
      }

      const content = result.candidates[0]?.content?.parts?.[0]?.text || '';
      return content.trim();
    } catch (error: unknown) {
      const err = error as AxiosError<{ error?: { message?: string } }>;
      let errorMessage = 'AI service request failed';
      let statusCode = HttpStatus.BAD_GATEWAY;

      if (err.response) {
        errorMessage = `Gemini API error: ${err.response.status} - ${err.response.data?.error?.message || 'No error details'}`;
        statusCode = err.response.status;
      } else if (err.request) {
        errorMessage = 'Gemini API request timed out or failed';
      } else {
        errorMessage = `Gemini API configuration error: ${err.message}`;
      }

      this.logger.error(`${errorMessage} | Prompt: ${prompt}`, err.stack);
      throw new HttpException(errorMessage, statusCode);
    }
  }

  async generateQuizSuggestions(
    clientProfile: ClientProfileDto,
  ): Promise<string[]> {
    if (!clientProfile || Object.keys(clientProfile).length === 0) {
      throw new BadRequestException('Invalid client profile');
    }

    try {
      const prompt = `Generate 3 relevant quiz questions for a microentrepreneur client:\n${JSON.stringify(clientProfile)}`;
      const rawText = await this.callGeminiApi(prompt, 250);

      // Robust question parsing
      const questions = rawText
        .split('\n')
        .filter((line) => /^\d+\.|^[-*]/.test(line)) // Match numbered/bulleted lines
        .map((q) => q.replace(/^\d+\.\s*|^[-*]\s*/, '').trim())
        .filter((q) => q.length > 0);

      if (questions.length === 0) {
        this.logger.warn(`No valid questions parsed from: ${rawText}`);
        return [
          'What are your primary business goals?',
          'What challenges do you face in your business?',
          'How do you manage business finances?',
        ];
      }

      return questions.slice(0, 3);
    } catch (error) {
      this.logger.error(
        `Quiz generation failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async analyzeLearningContent(
    profile: ClientProfileDto,
    learningStats: Record<string, unknown>,
  ): Promise<string> {
    if (!profile || Object.keys(profile).length === 0) {
      throw new BadRequestException('Invalid client profile');
    }
    if (!learningStats || Object.keys(learningStats).length === 0) {
      throw new BadRequestException('Learning stats cannot be empty');
    }

    try {
      const prompt = `Analyze learning content engagement:\nProfile:${JSON.stringify(profile)}\nStats:${JSON.stringify(learningStats)}`;
      return await this.callGeminiApi(prompt, 350);
    } catch (error) {
      this.logger.error(
        `Content analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async suggestInvestments(clientProfile: ClientProfileDto): Promise<string> {
    if (!clientProfile || Object.keys(clientProfile).length === 0) {
      throw new BadRequestException('Invalid client profile');
    }

    try {
      const prompt = `Suggest investment strategies for:\n${JSON.stringify(clientProfile)}`;
      return await this.callGeminiApi(prompt, 350);
    } catch (error) {
      this.logger.error(
        `Investment suggestion failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async suggestInsurance(clientProfile: ClientProfileDto): Promise<string> {
    if (!clientProfile || Object.keys(clientProfile).length === 0) {
      throw new BadRequestException('Invalid client profile');
    }

    try {
      const prompt = `Suggest insurance plans for:\n${JSON.stringify(clientProfile)}`;
      return await this.callGeminiApi(prompt, 350);
    } catch (error) {
      this.logger.error(
        `Insurance suggestion failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async analyzeProfile(clientProfile: ClientProfileDto): Promise<{
    quizSuggestions: string[];
    investmentAdvice: string;
    insuranceAdvice: string;
  }> {
    try {
      const [quizSuggestions, investmentAdvice, insuranceAdvice] =
        await Promise.all([
          this.generateQuizSuggestions(clientProfile),
          this.suggestInvestments(clientProfile),
          this.suggestInsurance(clientProfile),
        ]);

      return { quizSuggestions, investmentAdvice, insuranceAdvice };
    } catch (error) {
      this.logger.error(
        `Profile analysis failed: ${(error as any).message}`,
        (error as any).stack,
      );
      throw new InternalServerErrorException('Comprehensive analysis failed');
    }
  }
}
