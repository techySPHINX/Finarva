import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('AiController', () => {
  let controller: AiController;
  let aiService: AiService;

  const mockAiService = {
    generateQuizSuggestions: jest.fn().mockResolvedValue(['Q1', 'Q2', 'Q3']),
    analyzeLearningContent: jest
      .fn()
      .mockResolvedValue('Engagement looks good.'),
    suggestInvestments: jest.fn().mockResolvedValue('Invest in mutual funds.'),
    suggestInsurance: jest.fn().mockResolvedValue('Consider term insurance.'),
  };

  const inputClientProfile = {
    id: '1',
    name: 'Test Client',
    phone: '1234567890',
    agentId: 'agent1',
    language: 'en',
    goals: [],
  };

  const expectedMappedClientProfile = {
    id: 'unknown-id',
    name: 'unknown-name',
    phone: 'unknown-phone',
    agentId: 'unknown-agent',
    language: 'en',
    goals: [],
  };

  const learningData = {
    viewedContentIds: ['content1', 'content2'],
    completedContentIds: ['content2'],
    engagementScore: 75,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [{ provide: AiService, useValue: mockAiService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AiController>(AiController);
    aiService = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return quiz suggestions', async () => {
    const result = await controller.generateQuizQuestions({
      clientProfile: inputClientProfile,
    });

    expect(result).toEqual(['Q1', 'Q2', 'Q3']);
    expect(mockAiService.generateQuizSuggestions).toHaveBeenCalledWith(
      expectedMappedClientProfile,
    );
  });

  it('should return investment advice', async () => {
    const result = await controller.suggestInvestments({
      clientProfile: inputClientProfile,
    });

    expect(result).toContain('mutual funds');
    expect(mockAiService.suggestInvestments).toHaveBeenCalledWith(
      expectedMappedClientProfile,
    );
  });

  it('should return insurance advice', async () => {
    const result = await controller.suggestInsurance({
      clientProfile: inputClientProfile,
    });

    expect(result).toContain('term insurance');
    expect(mockAiService.suggestInsurance).toHaveBeenCalledWith(
      expectedMappedClientProfile,
    );
  });

  it('should return learning content insights', async () => {
    const result = await controller.analyzeLearningContent({
      clientProfile: inputClientProfile,
      learningData,
    });

    expect(result).toContain('Engagement looks good');
    expect(mockAiService.analyzeLearningContent).toHaveBeenCalledWith(
      expectedMappedClientProfile,
      learningData,
    );
  });
});
