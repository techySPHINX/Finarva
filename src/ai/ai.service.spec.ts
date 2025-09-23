import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { AiService } from './ai.service';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('AiService', () => {
  let service: AiService;
  let aiQueue: { add: jest.Mock };

  beforeEach(async () => {
    aiQueue = { add: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: getQueueToken('ai-queue'),
          useValue: aiQueue,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    jest.clearAllMocks();
  });

  describe('generateQuizSuggestions', () => {
    const clientProfile = {
      id: '1',
      name: 'John',
      phone: '123',
      agentId: 'a1',
      language: 'en',
      goals: [],
    };

    it('should add a quiz-suggestions-job to the queue', async () => {
      aiQueue.add.mockResolvedValue({ id: 'job-id-1' });
      const result = await service.generateQuizSuggestions(clientProfile);
      expect(aiQueue.add).toHaveBeenCalledWith(
        'quiz-suggestions-job',
        { clientProfile },
        expect.any(Object),
      );
      expect(result).toEqual({
        jobId: 'job-id-1',
        message: 'quiz-suggestions-job has been queued.',
      });
    });

    it('should throw BadRequestException if clientProfile is invalid', async () => {
      await expect(service.generateQuizSuggestions({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on queue error', async () => {
      aiQueue.add.mockRejectedValue(new Error('Queue error'));
      await expect(
        service.generateQuizSuggestions(clientProfile),
      ).rejects.toThrow(InternalServerErrorException);
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
    const learningData = { module: 'watched' };

    it('should add a content-analysis-job to the queue', async () => {
      aiQueue.add.mockResolvedValue({ id: 'job-id-2' });
      const result = await service.analyzeLearningContent(
        clientProfile,
        learningData,
      );
      expect(aiQueue.add).toHaveBeenCalledWith(
        'content-analysis-job',
        { profile: clientProfile, learningStats: learningData },
        expect.any(Object),
      );
      expect(result).toEqual({
        jobId: 'job-id-2',
        message: 'content-analysis-job has been queued.',
      });
    });

    it('should throw BadRequestException if clientProfile is invalid', async () => {
      await expect(
        service.analyzeLearningContent({} as any, learningData),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if learningData is empty', async () => {
      await expect(
        service.analyzeLearningContent(clientProfile, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on queue error', async () => {
      aiQueue.add.mockRejectedValue(new Error('Queue error'));
      await expect(
        service.analyzeLearningContent(clientProfile, learningData),
      ).rejects.toThrow(InternalServerErrorException);
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

    it('should add an investment-suggestions-job to the queue', async () => {
      aiQueue.add.mockResolvedValue({ id: 'job-id-3' });
      const result = await service.suggestInvestments(clientProfile);
      expect(aiQueue.add).toHaveBeenCalledWith(
        'investment-suggestions-job',
        { clientProfile },
        expect.any(Object),
      );
      expect(result).toEqual({
        jobId: 'job-id-3',
        message: 'investment-suggestions-job has been queued.',
      });
    });

    it('should throw BadRequestException if clientProfile is invalid', async () => {
      await expect(service.suggestInvestments({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on queue error', async () => {
      aiQueue.add.mockRejectedValue(new Error('Queue error'));
      await expect(service.suggestInvestments(clientProfile)).rejects.toThrow(
        InternalServerErrorException,
      );
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

    it('should add an insurance-suggestions-job to the queue', async () => {
      aiQueue.add.mockResolvedValue({ id: 'job-id-4' });
      const result = await service.suggestInsurance(clientProfile);
      expect(aiQueue.add).toHaveBeenCalledWith(
        'insurance-suggestions-job',
        { clientProfile },
        expect.any(Object),
      );
      expect(result).toEqual({
        jobId: 'job-id-4',
        message: 'insurance-suggestions-job has been queued.',
      });
    });

    it('should throw BadRequestException if clientProfile is invalid', async () => {
      await expect(service.suggestInsurance({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on queue error', async () => {
      aiQueue.add.mockRejectedValue(new Error('Queue error'));
      await expect(service.suggestInsurance(clientProfile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('generateFinancialAdvice', () => {
    it('should add a financial-advice-job to the queue', async () => {
      const financialData = { income: 1000, expenses: 500 };
      aiQueue.add.mockResolvedValue({ id: 'job-id-5' });
      const result = await service.generateFinancialAdvice(financialData);
      expect(aiQueue.add).toHaveBeenCalledWith(
        'financial-advice-job',
        { financialData },
        expect.any(Object),
      );
      expect(result).toEqual({
        jobId: 'job-id-5',
        message: 'financial-advice-job has been queued.',
      });
    });

    it('should throw BadRequestException if financialData is empty', async () => {
      await expect(service.generateFinancialAdvice({})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if financialData is null', async () => {
      await expect(service.generateFinancialAdvice(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on queue error', async () => {
      const financialData = { income: 1000, expenses: 500 };
      aiQueue.add.mockRejectedValue(new Error('Queue error'));
      await expect(
        service.generateFinancialAdvice(financialData),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
