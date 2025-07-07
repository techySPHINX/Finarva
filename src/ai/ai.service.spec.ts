import { AiService } from './ai.service';
import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AiService', () => {
  let service: AiService;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-api-key';
    service = new AiService();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw error if GEMINI_API_KEY is not set', () => {
      delete process.env.GEMINI_API_KEY;
      expect(() => new AiService()).toThrow('AI service configuration error');
    });
  });

  describe('callGeminiApi', () => {
    it('should throw BadRequestException if prompt is empty', async () => {
      await expect(service['callGeminiApi']('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return content if API call succeeds', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          candidates: [
            {
              content: {
                parts: [{ text: 'Sample response' }],
              },
            },
          ],
        },
      });

      const result = await service['callGeminiApi']('Test prompt');
      expect(result).toBe('Sample response');
    });

    it('should return fallback if candidates are empty', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} });

      const result = await service['callGeminiApi']('Test prompt');
      expect(result).toBe('No response generated');
    });

    it('should throw HttpException on Axios error', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { status: 502, data: { error: { message: 'Bad Gateway' } } },
      });

      await expect(service['callGeminiApi']('Test prompt')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('generateQuizSuggestions', () => {
    it('should throw BadRequestException if clientProfile is invalid', async () => {
      await expect(service.generateQuizSuggestions({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should parse questions correctly from API response', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: '1. Question one\n2. Question two\n3. Question three',
                  },
                ],
              },
            },
          ],
        },
      });

      const clientProfile = {
        id: '1',
        name: 'John',
        phone: '123',
        agentId: 'a1',
        language: 'en',
        goals: [],
      };
      const result = await service.generateQuizSuggestions(clientProfile);
      expect(result).toEqual([
        'Question one',
        'Question two',
        'Question three',
      ]);
    });

    it('should fallback to default questions if parsing fails', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          candidates: [
            {
              content: {
                parts: [{ text: 'No questions here' }],
              },
            },
          ],
        },
      });

      const clientProfile = {
        id: '1',
        name: 'John',
        phone: '123',
        agentId: 'a1',
        language: 'en',
        goals: [],
      };
      const result = await service.generateQuizSuggestions(clientProfile);
      expect(result.length).toBe(3);
    });
  });

  describe('analyzeLearningContent', () => {
    const clientProfile = {
      id: '1',
      name: 'John',
      phone: '123',
      agentId: 'a1',
      language: 'en',
      goals: [],
    };

    it('should throw BadRequestException if clientProfile is invalid', async () => {
      await expect(
        service.analyzeLearningContent({} as any, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if learningStats is empty', async () => {
      await expect(
        service.analyzeLearningContent(clientProfile, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return response on success', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          candidates: [
            {
              content: {
                parts: [{ text: 'Analysis result' }],
              },
            },
          ],
        },
      });

      const result = await service.analyzeLearningContent(clientProfile, {
        module: 'watched',
      });
      expect(result).toBe('Analysis result');
    });
  });

  describe('suggestInvestments', () => {
    const clientProfile = {
      id: '1',
      name: 'John',
      phone: '123',
      agentId: 'a1',
      language: 'en',
      goals: [],
    };

    it('should throw BadRequestException if clientProfile is invalid', async () => {
      await expect(service.suggestInvestments({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return investment suggestions on success', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          candidates: [
            {
              content: {
                parts: [{ text: 'Investment advice' }],
              },
            },
          ],
        },
      });

      const result = await service.suggestInvestments(clientProfile);
      expect(result).toBe('Investment advice');
    });
  });

  describe('suggestInsurance', () => {
    const clientProfile = {
      id: '1',
      name: 'John',
      phone: '123',
      agentId: 'a1',
      language: 'en',
      goals: [],
    };

    it('should throw BadRequestException if clientProfile is invalid', async () => {
      await expect(service.suggestInsurance({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return insurance suggestions on success', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          candidates: [
            {
              content: {
                parts: [{ text: 'Insurance advice' }],
              },
            },
          ],
        },
      });

      const result = await service.suggestInsurance(clientProfile);
      expect(result).toBe('Insurance advice');
    });
  });

  describe('analyzeProfile', () => {
    const clientProfile = {
      id: '1',
      name: 'John',
      phone: '123',
      agentId: 'a1',
      language: 'en',
      goals: [],
    };

    it('should return aggregated analysis', async () => {
      service.generateQuizSuggestions = jest
        .fn()
        .mockResolvedValue(['q1', 'q2']);
      service.suggestInvestments = jest.fn().mockResolvedValue('investment');
      service.suggestInsurance = jest.fn().mockResolvedValue('insurance');

      const result = await service.analyzeProfile(clientProfile);

      expect(result).toEqual({
        quizSuggestions: ['q1', 'q2'],
        investmentAdvice: 'investment',
        insuranceAdvice: 'insurance',
      });
    });

    it('should throw InternalServerErrorException on failure', async () => {
      service.generateQuizSuggestions = jest
        .fn()
        .mockRejectedValue(new Error('fail'));
      await expect(service.analyzeProfile(clientProfile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
