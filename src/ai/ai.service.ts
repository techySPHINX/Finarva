import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { ClientProfileDto } from '../clients/dto/client-profile.dto';

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly endpoint: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not set');
    }
  }

  private async callGeminiApi(
    prompt: string,
    _maxTokens = 300,
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${this.endpoint}?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: _maxTokens },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const result: {
        candidates?: {
          content?: {
            parts?: { text?: string }[];
          };
        }[];
      } = response.data;

      const content = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return content;
    } catch (error: unknown) {
      const err = error as AxiosError<{ error?: { message?: string } }>;
      const errorMessage =
        err.response?.data?.error?.message || err.message || 'Unknown error';

      throw new HttpException(
        `Gemini API error: ${errorMessage}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async generateQuizSuggestions(
    clientProfile: ClientProfileDto,
  ): Promise<string[]> {
    const prompt = `You are an AI assistant. Generate 3 relevant quiz questions (without answers or options) for a microentrepreneur client with the following profile:\n${JSON.stringify(
      clientProfile,
    )}`;
    const rawText = await this.callGeminiApi(prompt, 250);

    const questions = rawText
      .split('\n')
      .map((q: string) => q.trim())
      .filter((q: string) => q.length > 0);

    return questions;
  }

  async analyzeLearningContent(
    profile: ClientProfileDto,
    learningStats: Record<string, unknown>,
  ): Promise<string> {
    const prompt = `Analyze the learning content engagement for this client:\nProfile:\n${JSON.stringify(
      profile,
    )}\nLearning Stats:\n${JSON.stringify(
      learningStats,
    )}\nProvide a brief summary and suggest new content or improvements.`;
    return this.callGeminiApi(prompt, 300);
  }

  async suggestInvestments(clientProfile: ClientProfileDto): Promise<string> {
    const prompt = `Based on the following client profile:\n${JSON.stringify(
      clientProfile,
    )}\nSuggest personalized investment strategies considering goals, income, and risk tolerance.`;
    return this.callGeminiApi(prompt, 300);
  }

  async suggestInsurance(clientProfile: ClientProfileDto): Promise<string> {
    const prompt = `Suggest suitable insurance plans based on the following profile:\n${JSON.stringify(
      clientProfile,
    )}\nInclude reasoning based on age, occupation, income, dependents, existing insurance, and health status.`;
    return this.callGeminiApi(prompt, 300);
  }

  async analyzeProfile(clientProfile: ClientProfileDto): Promise<{
    quizSuggestions: string[];
    investmentAdvice: string;
    insuranceAdvice: string;
  }> {
    const [quizSuggestions, investmentAdvice, insuranceAdvice] =
      await Promise.all([
        this.generateQuizSuggestions(clientProfile),
        this.suggestInvestments(clientProfile),
        this.suggestInsurance(clientProfile),
      ]);

    return {
      quizSuggestions,
      investmentAdvice,
      insuranceAdvice,
    };
  }
}
