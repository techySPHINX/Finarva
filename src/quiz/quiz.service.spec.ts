
import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from './quiz.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

const mockPrismaService = () => ({
  primary: {
    quiz: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    question: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
    clientQuizAttempt: {
      create: jest.fn(),
    },
  },
  readReplica: {
    quiz: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    client: {
      findUnique: jest.fn(),
    },
    clientQuizAttempt: {
      findMany: jest.fn(),
    },
  },
});

const mockAiService = () => ({
  generateQuizSuggestions: jest.fn(),
});

describe('QuizService', () => {
  let service: QuizService;
  let prismaService: any;
  let aiService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        { provide: PrismaService, useFactory: mockPrismaService },
        { provide: AiService, useFactory: mockAiService },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
    prismaService = module.get<PrismaService>(PrismaService);
    aiService = module.get<AiService>(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createQuiz', () => {
    it('should create a quiz', async () => {
      prismaService.primary.quiz.create.mockResolvedValue({ id: '1', title: 'Quiz', language: 'en' });
      const dto = { title: 'Quiz', language: 'en' };
      const result = await service.createQuiz(dto as any, 'user1');
      expect(result).toHaveProperty('id', '1');
      expect(prismaService.primary.quiz.create).toHaveBeenCalled();
    });
    it('should throw BadRequestException if title or language missing', async () => {
      await expect(service.createQuiz({ title: '' } as any, 'user1')).rejects.toThrow(BadRequestException);
    });
    it('should throw BadRequestException if quiz already exists', async () => {
      prismaService.primary.quiz.create.mockRejectedValue({ code: 'P2002', message: 'Unique constraint' });
      await expect(service.createQuiz({ title: 'Quiz', language: 'en' } as any, 'user1')).rejects.toThrow(BadRequestException);
    });
    it('should throw InternalServerErrorException on other errors', async () => {
      prismaService.primary.quiz.create.mockRejectedValue({ message: 'DB error' });
      await expect(service.createQuiz({ title: 'Quiz', language: 'en' } as any, 'user1')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('addQuestion', () => {
    it('should add a question to a quiz', async () => {
      prismaService.readReplica.quiz.findUnique.mockResolvedValue({ id: '1' });
      prismaService.primary.question.create.mockResolvedValue({ id: 'q1' });
      const dto = { quizId: '1', question: 'Q?', answer: 'A', options: [], language: 'en' };
      const result = await service.addQuestion(dto as any);
      expect(result).toHaveProperty('id', 'q1');
    });
    it('should throw BadRequestException if required fields missing', async () => {
      await expect(service.addQuestion({} as any)).rejects.toThrow(BadRequestException);
    });
    it('should throw NotFoundException if quiz not found', async () => {
      prismaService.readReplica.quiz.findUnique.mockResolvedValue(null);
      await expect(service.addQuestion({ quizId: '1', question: 'Q?', answer: 'A' } as any)).rejects.toThrow(NotFoundException);
    });
    it('should throw InternalServerErrorException on DB error', async () => {
      prismaService.readReplica.quiz.findUnique.mockResolvedValue({ id: '1' });
      prismaService.primary.question.create.mockRejectedValue({ message: 'DB error' });
      await expect(service.addQuestion({ quizId: '1', question: 'Q?', answer: 'A' } as any)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getAllQuizzes', () => {
    it('should return paginated quizzes', async () => {
      prismaService.readReplica.quiz.findMany.mockResolvedValue([{ id: '1' }]);
      prismaService.readReplica.quiz.count.mockResolvedValue(1);
      prismaService.readReplica.$transaction = jest.fn().mockResolvedValue([[{ id: '1' }], 1]);
      const result = await service.getAllQuizzes('en', ['tag'], 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
    it('should throw InternalServerErrorException on error', async () => {
      prismaService.readReplica.$transaction = jest.fn().mockRejectedValue({ message: 'DB error' });
      await expect(service.getAllQuizzes('en', [], 1, 10)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getQuizById', () => {
    it('should return quiz by id', async () => {
      prismaService.readReplica.quiz.findUnique.mockResolvedValue({ id: '1', questions: [] });
      const result = await service.getQuizById('1');
      expect(result).toHaveProperty('id', '1');
    });
    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.getQuizById('')).rejects.toThrow(BadRequestException);
    });
    it('should throw NotFoundException if quiz not found', async () => {
      prismaService.readReplica.quiz.findUnique.mockResolvedValue(null);
      await expect(service.getQuizById('1')).rejects.toThrow(NotFoundException);
    });
    it('should throw InternalServerErrorException on DB error', async () => {
      prismaService.readReplica.quiz.findUnique.mockRejectedValue({ message: 'DB error' });
      await expect(service.getQuizById('1')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getQuizByIdConsistent', () => {
    it('should return quiz by id from primary', async () => {
      prismaService.primary.quiz.findUnique.mockResolvedValue({ id: '1', questions: [] });
      const result = await service.getQuizByIdConsistent('1');
      expect(result).toHaveProperty('id', '1');
    });
    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.getQuizByIdConsistent('')).rejects.toThrow(BadRequestException);
    });
    it('should throw NotFoundException if quiz not found', async () => {
      prismaService.primary.quiz.findUnique.mockResolvedValue(null);
      await expect(service.getQuizByIdConsistent('1')).rejects.toThrow(NotFoundException);
    });
    it('should throw InternalServerErrorException on DB error', async () => {
      prismaService.primary.quiz.findUnique.mockRejectedValue({ message: 'DB error' });
      await expect(service.getQuizByIdConsistent('1')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateQuiz', () => {
    it('should update quiz', async () => {
      prismaService.primary.quiz.update.mockResolvedValue({ id: '1', title: 'Updated' });
      const result = await service.updateQuiz('1', { title: 'Updated' } as any);
      expect(result).toHaveProperty('title', 'Updated');
    });
    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.updateQuiz('', {} as any)).rejects.toThrow(BadRequestException);
    });
    it('should throw NotFoundException if quiz not found', async () => {
      prismaService.primary.quiz.update.mockRejectedValue({ code: 'P2025' });
      await expect(service.updateQuiz('1', {} as any)).rejects.toThrow(NotFoundException);
    });
    it('should throw BadRequestException for invalid id format', async () => {
      prismaService.primary.quiz.update.mockRejectedValue({ code: 'P2023' });
      await expect(service.updateQuiz('1', {} as any)).rejects.toThrow(BadRequestException);
    });
    it('should throw InternalServerErrorException on DB error', async () => {
      prismaService.primary.quiz.update.mockRejectedValue({ message: 'DB error' });
      await expect(service.updateQuiz('1', {} as any)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteQuiz', () => {
    it('should delete quiz and its questions', async () => {
      prismaService.primary.$transaction.mockImplementation(async (cb: any) => cb(prismaService.primary));
      prismaService.primary.question.deleteMany.mockResolvedValue({});
      prismaService.primary.quiz.delete.mockResolvedValue({ id: '1' });
      const result = await service.deleteQuiz('1');
      expect(result).toHaveProperty('id', '1');
    });
    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.deleteQuiz('')).rejects.toThrow(BadRequestException);
    });
    it('should throw NotFoundException if quiz not found', async () => {
      prismaService.primary.$transaction.mockRejectedValue({ code: 'P2025' });
      await expect(service.deleteQuiz('1')).rejects.toThrow(NotFoundException);
    });
    it('should throw BadRequestException for invalid id format', async () => {
      prismaService.primary.$transaction.mockRejectedValue({ code: 'P2023' });
      await expect(service.deleteQuiz('1')).rejects.toThrow(BadRequestException);
    });
    it('should throw InternalServerErrorException on DB error', async () => {
      prismaService.primary.$transaction.mockRejectedValue({ message: 'DB error' });
      await expect(service.deleteQuiz('1')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('submitQuiz', () => {
    it('should submit quiz and calculate score', async () => {
      prismaService.readReplica.client.findUnique.mockResolvedValue({ id: 'c1' });
      prismaService.readReplica.quiz.findUnique.mockResolvedValue({
        id: 'q1',
        questions: [
          { answer: 'A' },
          { answer: 'B' },
        ],
      });
      prismaService.primary.clientQuizAttempt.create.mockResolvedValue({ id: 'a1', score: 2 });
      const dto = { quizId: 'q1', answers: ['A', 'B'] };
      const result = await service.submitQuiz('c1', dto as any);
      expect(result).toHaveProperty('id', 'a1');
      expect(result.score).toBe(2);
    });
    it('should throw BadRequestException for invalid clientId', async () => {
      await expect(service.submitQuiz('', { quizId: 'q1', answers: [] } as any)).rejects.toThrow(BadRequestException);
    });
    it('should throw BadRequestException if quizId or answers missing', async () => {
      await expect(service.submitQuiz('c1', { quizId: '', answers: [] } as any)).rejects.toThrow(BadRequestException);
    });
    it('should throw NotFoundException if client not found', async () => {
      prismaService.readReplica.client.findUnique.mockResolvedValue(null);
      await expect(service.submitQuiz('c1', { quizId: 'q1', answers: [] } as any)).rejects.toThrow(NotFoundException);
    });
    it('should throw BadRequestException if quiz has no questions', async () => {
      prismaService.readReplica.client.findUnique.mockResolvedValue({ id: 'c1' });
      prismaService.readReplica.quiz.findUnique.mockResolvedValue({ id: 'q1', questions: [] });
      await expect(service.submitQuiz('c1', { quizId: 'q1', answers: [] } as any)).rejects.toThrow(BadRequestException);
    });
    it('should throw InternalServerErrorException on DB error', async () => {
      prismaService.readReplica.client.findUnique.mockResolvedValue({ id: 'c1' });
      prismaService.readReplica.quiz.findUnique.mockRejectedValue({ message: 'DB error' });
      await expect(service.submitQuiz('c1', { quizId: 'q1', answers: [] } as any)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getAttemptsByClient', () => {
    it('should return attempts for a client', async () => {
      prismaService.readReplica.clientQuizAttempt.findMany.mockResolvedValue([{ id: 'a1' }]);
      const result = await service.getAttemptsByClient('c1', 1, 10);
      expect(result[0]).toHaveProperty('id', 'a1');
    });
    it('should throw BadRequestException for invalid clientId', async () => {
      await expect(service.getAttemptsByClient('', 1, 10)).rejects.toThrow(BadRequestException);
    });
    it('should throw InternalServerErrorException on DB error', async () => {
      prismaService.readReplica.clientQuizAttempt.findMany.mockRejectedValue({ message: 'DB error' });
      await expect(service.getAttemptsByClient('c1', 1, 10)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getQuizSuggestionsFromAI', () => {
    it('should return AI quiz suggestions', async () => {
      prismaService.readReplica.client.findUnique.mockResolvedValue({
        id: 'c1',
        name: 'Test',
        phone: '123',
        agentId: 'a1',
        preferredLanguage: 'en',
        interests: [],
        goals: [],
        quizAttempts: [],
      });
      aiService.generateQuizSuggestions.mockResolvedValue(['quiz1', 'quiz2']);
      const result = await service.getQuizSuggestionsFromAI('c1');
      expect(result).toEqual(['quiz1', 'quiz2']);
    });
    it('should throw BadRequestException for invalid clientId', async () => {
      await expect(service.getQuizSuggestionsFromAI('')).rejects.toThrow(BadRequestException);
    });
    it('should throw NotFoundException if client not found', async () => {
      prismaService.readReplica.client.findUnique.mockResolvedValue(null);
      await expect(service.getQuizSuggestionsFromAI('c1')).rejects.toThrow(NotFoundException);
    });
    it('should throw InternalServerErrorException on DB error', async () => {
      prismaService.readReplica.client.findUnique.mockRejectedValue({ message: 'DB error' });
      await expect(service.getQuizSuggestionsFromAI('c1')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
