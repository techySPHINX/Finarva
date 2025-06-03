import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from './quiz.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { NotFoundException } from '@nestjs/common';

describe('QuizService', () => {
  let service: QuizService;

  const mockPrisma = {
    quiz: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    question: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    client: {
      findUnique: jest.fn(),
    },
    clientQuizAttempt: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockAiService = {
    generateQuizSuggestions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw if quiz not found when adding question', async () => {
    mockPrisma.quiz.findUnique.mockResolvedValue(null);
    await expect(
      service.addQuestion({
        quizId: 'fake',
        question: 'Q?',
        options: ['A', 'B'],
        answer: 'A',
        language: 'en',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return quiz on getQuizById', async () => {
    const quiz = { id: 'q1', questions: [] };
    mockPrisma.quiz.findUnique.mockResolvedValue(quiz);
    const result = await service.getQuizById('q1');
    expect(result).toEqual(quiz);
  });

  it('should validate quiz answers and return score', async () => {
    const mockQuiz = {
      id: 'quiz1',
      questions: [{ answer: 'A' }, { answer: 'B' }, { answer: 'C' }],
    };
    jest.spyOn(service as any, 'getQuizById').mockResolvedValue(mockQuiz);
    const result = await (service as any).validateQuizAnswers('quiz1', [
      'a',
      'b',
      'd',
    ]);
    expect(result.score).toBe(2);
  });

  it('should get quiz suggestions from AI', async () => {
    const clientData = {
      id: 'c1',
      name: 'User',
      phone: '123',
      agentId: 'a1',
      preferredLanguage: 'en',
      interests: ['finance'],
      goals: ['learn'],
      quizAttempts: [],
    };
    mockPrisma.client.findUnique.mockResolvedValue(clientData);
    await service.getQuizSuggestionsFromAI('c1');
    expect(mockAiService.generateQuizSuggestions).toHaveBeenCalled();
  });
});
