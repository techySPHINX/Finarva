import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ClientProfileDto } from '../clients/dto/client-profile.dto'; // assuming this is the correct path

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.baseUrl = 'https://api.gemini.ai/v1';

    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not set');
    }
  }

  private async callGeminiApi(payload: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      const err = error as any;
      throw new HttpException(
        `Gemini API error: ${err.response?.data?.message || err.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Generate 3 quiz questions relevant to a microentrepreneur client profile.
   */
  async generateQuizSuggestions(clientProfile: ClientProfileDto): Promise<string[]> {
    const prompt = `You are an AI assistant. Generate 3 relevant quiz questions (without answers/options) for a microentrepreneur client with profile:\n${JSON.stringify(
      clientProfile,
    )}`;

    const payload = {
      model: 'gemini-1',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 250,
    };

    const result = await this.callGeminiApi(payload);
    const rawText = result.choices?.[0]?.message?.content || '';

    // Split questions by new lines, filtering empty lines
    const questions = rawText
      .split('\n')
      .map((q: string) => q.trim())
      .filter((q: string | any[]) => q.length > 0);

    return questions;
  }

  /**
   * Analyze learning content engagement and suggest new content.
   */
  async analyzeLearningContent(profile: ClientProfileDto, learningStats: any): Promise<string> {
    const prompt = `Analyze the learning content engagement for the client profile:\n${JSON.stringify(
      profile,
    )}\nGiven the learning content stats:\n${JSON.stringify(
      learningStats,
    )}\nProvide a summary and suggest new content topics or improvements.`;

    const payload = {
      model: 'gemini-1',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    };

    const result = await this.callGeminiApi(payload);
    return result.choices?.[0]?.message?.content || 'No analysis available.';
  }

  /**
   * Suggest personalized investment strategies.
   */
  async suggestInvestments(clientProfile: ClientProfileDto): Promise<string> {
    const prompt = `Based on the client profile:\n${JSON.stringify(
      clientProfile,
    )}\nSuggest personalized investment strategies considering goals, income, and risk tolerance.`;

    const payload = {
      model: 'gemini-1',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    };

    const result = await this.callGeminiApi(payload);
    return result.choices?.[0]?.message?.content || 'No investment suggestions available.';
  }

  /**
   * Suggest suitable insurance plans.
   */
  async suggestInsurance(clientProfile: ClientProfileDto): Promise<string> {
    const prompt = `Based on the client profile below, suggest suitable insurance plans with justifications:\n${JSON.stringify(
      clientProfile,
    )}\nPlease consider age, occupation, income, dependents, existing insurance, and health status.`;

    const payload = {
      model: 'gemini-1',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    };

    const result = await this.callGeminiApi(payload);
    return result.choices?.[0]?.message?.content || 'No insurance suggestions available.';
  }

  async analyzeProfile(clientProfile: ClientProfileDto): Promise<any> {
  const [quizSuggestions, investmentAdvice, insuranceAdvice] = await Promise.all([
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
