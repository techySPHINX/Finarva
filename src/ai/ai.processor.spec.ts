
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import axios from 'axios';
import { AIProcessor } from './ai.processor';
import { BadRequestException, HttpException, HttpStatus, Logger } from '@nestjs/common';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AIProcessor', () => {

  let processor: AIProcessor;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    process.env.GEMINI_API_KEY = 'test-api-key';
    const module: TestingModule = await Test.createTestingModule({
      providers: [AIProcessor],
    }).compile();

    processor = module.get<AIProcessor>(AIProcessor);
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    loggerErrorSpy.mockRestore();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  describe('constructor', () => {
    it('should not throw error if GEMINI_API_KEY is set', () => {
      expect(() => new AIProcessor()).not.toThrow();
    });

    it('should log an error if GEMINI_API_KEY is not set', () => {
      delete process.env.GEMINI_API_KEY;
      new AIProcessor();
      expect(loggerErrorSpy).toHaveBeenCalledWith('GEMINI_API_KEY environment variable not set');
    });
  });

  describe('callGeminiApi', () => {
    it('should throw BadRequestException if prompt is empty', async () => {
      await expect(processor['callGeminiApi']('')).rejects.toThrow(
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

      const result = await processor['callGeminiApi']('Test prompt');
      expect(result).toBe('Sample response');
    });

    it('should return fallback if candidates are empty', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} });

      const result = await processor['callGeminiApi']('Test prompt');
      expect(result).toBe('No response generated');
    });

    it('should throw HttpException on Axios error', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { status: 502, data: { error: { message: 'Bad Gateway' } } },
      });

      await expect(processor['callGeminiApi']('Test prompt')).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw HttpException on network error', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network Error'));

      await expect(processor['callGeminiApi']('Test prompt')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('handleFinancialAdvice', () => {
    const mockJob: Job = {
      id: 'job-1',
      data: { financialData: { income: 1000, expenses: 500 } },
      name: 'financial-advice-job',
      queueName: 'ai-queue',
      // Add other properties of Job if needed for mocking
    } as Job;

    it('should process financial advice job successfully', async () => {
      const callGeminiApiSpy = jest.spyOn(processor as any, 'callGeminiApi');
      callGeminiApiSpy.mockResolvedValue('Financial advice generated');

      const result = await processor.handleFinancialAdvice(mockJob);

      expect(callGeminiApiSpy).toHaveBeenCalledWith(
        expect.stringContaining(JSON.stringify(mockJob.data.financialData)),
        500,
      );
      expect(result).toEqual({ advice: 'Financial advice generated' });
    });

    it('should throw error if callGeminiApi fails', async () => {
      const callGeminiApiSpy = jest.spyOn(processor as any, 'callGeminiApi');
      callGeminiApiSpy.mockRejectedValue(new Error('AI API error'));

      await expect(processor.handleFinancialAdvice(mockJob)).rejects.toThrow(
        'AI API error',
      );
    });
  });
});
