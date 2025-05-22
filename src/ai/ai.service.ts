import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ClientProfileDto } from '../clients/dto/client-profile.dto';

@Injectable()
export class AiService {
  analyzeProfile(profile: ClientProfileDto) {
   throw new Error('Method not implemented.');
  }
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.baseUrl = 'https://api.gemini.ai/v1'; 

    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not set in environment variables');
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
      throw new HttpException(
        `Gemini API error: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async generateQuizSuggestions(clientProfile: any): Promise<string[]> {
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
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    return questions;
  }

  async analyzeLearningContent(profile: any, learningStats: any): Promise<string> {
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

  async suggestInvestments(clientProfile: any): Promise<string> {
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
}
