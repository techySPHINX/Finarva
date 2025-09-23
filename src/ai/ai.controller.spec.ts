import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('AiController', () => {
  let controller: AiController;
  let aiService: AiService;

  const mockAiService = {
    generateQuizSuggestions: jest.fn(),
    analyzeLearningContent: jest.fn(),
    suggestInvestments: jest.fn(),
    suggestInsurance: jest.fn(),
    generateFinancialAdvice: jest.fn(), // Added
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [{ provide: AiService, useValue: mockAiService }],
    }).compile();

    controller = module.get<AiController>(AiController);
    aiService = module.get<AiService>(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateQuizQuestions', () => {
    it('should return quiz suggestions successfully', async () => {
      const dto = { clientProfile: { language: 'en', goals: [] } } as any;
      const result = ['q1', 'q2'];
      mockAiService.generateQuizSuggestions.mockResolvedValue(result);

      expect(await controller.generateQuizQuestions(dto)).toEqual(result);
    });

    it('should throw BadRequestException if clientProfile missing', async () => {
      await expect(controller.generateQuizQuestions({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on failure', async () => {
      const dto = { clientProfile: { language: 'en', goals: [] } } as any;
      mockAiService.generateQuizSuggestions.mockRejectedValue(
        new Error('AI error'),
      );

      await expect(controller.generateQuizQuestions(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('analyzeLearningContent', () => {
    it('should return content insights successfully', async () => {
      const dto = {
        clientProfile: { language: 'en', goals: [] },
        learningData: { module1: 'watched' },
      } as any;
      const result = 'insights';
      mockAiService.analyzeLearningContent.mockResolvedValue(result);

      expect(await controller.analyzeLearningContent(dto)).toEqual(result);
    });

    it('should throw BadRequestException if clientProfile missing', async () => {
      await expect(
        controller.analyzeLearningContent({ learningData: {} } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if learningData missing or empty', async () => {
      await expect(
        controller.analyzeLearningContent({ clientProfile: {} } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on failure', async () => {
      const dto = {
        clientProfile: { language: 'en', goals: [] },
        learningData: { module: 'watched' },
      } as any;
      mockAiService.analyzeLearningContent.mockRejectedValue(
        new Error('AI error'),
      );

      await expect(controller.analyzeLearningContent(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('suggestInvestments', () => {
    it('should return investment suggestions successfully', async () => {
      const dto = { clientProfile: { language: 'en', goals: [] } } as any;
      const result = 'investment suggestion';
      mockAiService.suggestInvestments.mockResolvedValue(result);

      expect(await controller.suggestInvestments(dto)).toEqual(result);
    });

    it('should throw BadRequestException if clientProfile missing', async () => {
      await expect(controller.suggestInvestments({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on failure', async () => {
      const dto = { clientProfile: { language: 'en', goals: [] } } as any;
      mockAiService.suggestInvestments.mockRejectedValue(new Error('AI error'));

      await expect(controller.suggestInvestments(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('suggestInsurance', () => {
    it('should return insurance suggestions successfully', async () => {
      const dto = { clientProfile: { language: 'en', goals: [] } } as any;
      const result = 'insurance suggestion';
      mockAiService.suggestInsurance.mockResolvedValue(result);

      expect(await controller.suggestInsurance(dto)).toEqual(result);
    });

    it('should throw BadRequestException if clientProfile missing', async () => {
      await expect(controller.suggestInsurance({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on failure', async () => {
      const dto = { clientProfile: { language: 'en', goals: [] } } as any;
      mockAiService.suggestInsurance.mockRejectedValue(new Error('AI error'));

      await expect(controller.suggestInsurance(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('generateFinancialAdvice', () => {
    it('should return job ID and message on success', async () => {
      const financialData = { income: 1000, expenses: 500 };
      const mockResult = { jobId: 'job-123', message: 'Job queued' };
      mockAiService.generateFinancialAdvice.mockResolvedValue(mockResult);

      const result = await controller.generateFinancialAdvice(financialData);
      expect(result).toEqual(mockResult);
      expect(mockAiService.generateFinancialAdvice).toHaveBeenCalledWith(financialData);
    });

    it('should throw BadRequestException if financialData is missing', async () => {
      await expect(controller.generateFinancialAdvice(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on failure', async () => {
      const financialData = { income: 1000, expenses: 500 };
      mockAiService.generateFinancialAdvice.mockRejectedValue(new Error('AI error'));

      await expect(controller.generateFinancialAdvice(financialData)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
