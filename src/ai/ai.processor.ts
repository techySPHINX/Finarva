import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import {
  Logger,
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';

@Injectable()
@Processor('ai-queue')
export class AIProcessor {
  private readonly logger = new Logger(AIProcessor.name);
  private readonly apiKey: string;
  private readonly textGenerationEndpoint: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.textGenerationEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
    if (!this.apiKey) {
      this.logger.error('GEMINI_API_KEY environment variable not set');
    }
  }

  async handleFinancialAdvice(job: Job<any>) {
    this.logger.log(
      `Processing job ${job.id} with data: ${JSON.stringify(job.data)}`,
    );
    const { financialData } = job.data;

    try {
      const prompt = `Based on the following financial data, provide personalized advice for a microentrepreneur:
${JSON.stringify(
        financialData,
      )}`;
      const advice = await this.callGeminiApi(prompt, 500);
      this.logger.log(`Job ${job.id} completed successfully.`);
      return { advice };
    } catch (error) {
      this.logger.error(
        `Job ${job.id} failed`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
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
        `${this.textGenerationEndpoint}?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: maxTokens },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
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
        errorMessage = `Gemini API error: ${err.response.status} - ${err.response.data?.error?.message || 'No error details'
          }`;
        statusCode = err.response.status;
      } else if (err.request) {
        errorMessage = 'AI service made a request but received no response';
        statusCode = HttpStatus.GATEWAY_TIMEOUT;
      }

      this.logger.error(errorMessage, err.stack);
      throw new HttpException(errorMessage, statusCode);
    }
  }
}
