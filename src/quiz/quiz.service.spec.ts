import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from './quiz.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { AddQuestionDto } from './dto/add-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

describe('QuizService', () => {
  let service: QuizService;
  let prisma: PrismaService;
  let aiService: AiService;

  // Complete mock objects matching Prisma models
  const mockClient = {
    id: 'client-1',
    language: 'en',
    createdAt: new Date(),
    name: 'John Doe',
    phone: '1234567890',
    age: 35,
    gender: 'Male',
    income: 75000,
    goals: ['Retirement', 'Wealth Building'],
    occupation: 'Software Engineer',
    interests: ['Technology', 'Investing'],
    preferredLanguage: 'en',
    investmentExperience: 'Intermediate',
    agentId: 'agent-1',
  };

  const mockQuestion = {
    id: 'question-1',
    quizId: 'quiz-1',
    question: 'What is 2+2?',
    options: ['3', '4', '5'],
    answer: '4',
    language: 'en',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQuiz = {
    id: 'quiz-1',
    title: 'Test Quiz',
    description: 'Test Description',
    language: 'en',
    difficultyLevel: 'easy',
    tags: ['test'],
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    questions: [mockQuestion],
  };

  const mockAttempt = {
    id: 'attempt-1',
    clientId: 'client-1',
    quizId: 'quiz-1',
    score: 3,
    answers: ['4', '5', '4'],
    createdAt: new Date(),
  };

  // Quiz with multiple questions for submitQuiz tests
  const mockQuizWithQuestions = {
    ...mockQuiz,
    questions: [
      { ...mockQuestion },
      {
        ...mockQuestion,
        id: 'question-2',
        question: 'What is 3+3?',
        options: ['5', '6', '7'],
        answer: '6',
      },
      {
        ...mockQuestion,
        id: 'question-3',
        question: 'What is 4+4?',
        options: ['7', '8', '9'],
        answer: '8',
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            quiz: {
              create: jest.fn().mockResolvedValue(mockQuiz),
              findUnique: jest.fn().mockResolvedValue(mockQuiz),
              findMany: jest.fn().mockResolvedValue([mockQuiz]),
              update: jest.fn().mockResolvedValue(mockQuiz),
              delete: jest.fn().mockResolvedValue(mockQuiz),
            },
            question: {
              create: jest.fn().mockResolvedValue(mockQuestion),
              deleteMany: jest.fn().mockResolvedValue({ count: 3 }),
            },
            client: {
              findUnique: jest.fn().mockResolvedValue(mockClient),
            },
            clientQuizAttempt: {
              create: jest.fn().mockResolvedValue(mockAttempt),
              findMany: jest.fn().mockResolvedValue([mockAttempt]),
            },
          },
        },
        {
          provide: AiService,
          useValue: {
            generateQuizSuggestions: jest
              .fn()
              .mockResolvedValue(['quiz-1', 'quiz-2']),
          },
        },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
    prisma = module.get<PrismaService>(PrismaService);
    aiService = module.get<AiService>(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createQuiz', () => {
    const validDto: CreateQuizDto = {
      title: 'Test Quiz',
      language: 'en',
      tags: ['test'],
    };

    it('should create a quiz successfully', async () => {
      const result = await service.createQuiz(validDto, 'user-1');
      expect(result).toEqual(mockQuiz);
      expect(prisma.quiz.create).toHaveBeenCalledWith({
        data: {
          ...validDto,
          description: '',
          createdBy: 'user-1',
        },
      });
    });

    it('should throw BadRequestException if title missing', async () => {
      const invalidDto = { ...validDto, title: undefined } as any;
      await expect(service.createQuiz(invalidDto, 'user-1')).rejects.toThrow(
        new BadRequestException('Title and language are required'),
      );
    });

    it('should throw BadRequestException if language missing', async () => {
      const invalidDto = { ...validDto, language: undefined } as any;
      await expect(service.createQuiz(invalidDto, 'user-1')).rejects.toThrow(
        new BadRequestException('Title and language are required'),
      );
    });

    it('should throw BadRequestException on duplicate title', async () => {
      (prisma.quiz.create as jest.Mock).mockRejectedValueOnce({
        code: 'P2002',
        meta: { target: ['title', 'language'] },
      });
      await expect(service.createQuiz(validDto, 'user-1')).rejects.toThrow(
        new BadRequestException('Quiz with this title already exists'),
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      (prisma.quiz.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB error'),
      );
      await expect(service.createQuiz(validDto, 'user-1')).rejects.toThrow(
        new InternalServerErrorException('Failed to create quiz'),
      );
    });
  });

  describe('addQuestion', () => {
    const validDto: AddQuestionDto = {
      quizId: 'quiz-1',
      question: 'What is 2+2?',
      answer: '4',
      options: ['3', '4', '5'],
      language: 'en',
    };

    it('should add a question successfully', async () => {
      const result = await service.addQuestion(validDto);
      expect(result).toEqual(mockQuestion);
      expect(prisma.question.create).toHaveBeenCalledWith({
        data: validDto,
      });
    });

    it('should throw BadRequestException if required fields missing', async () => {
      const invalidDto = { ...validDto, question: undefined } as any;
      await expect(service.addQuestion(invalidDto)).rejects.toThrow(
        new BadRequestException('Quiz ID, question, and answer are required'),
      );
    });

    it('should throw NotFoundException if quiz not found', async () => {
      (prisma.quiz.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.addQuestion(validDto)).rejects.toThrow(
        new NotFoundException('Quiz not found'),
      );
    });

    it('should throw InternalServerErrorException on error', async () => {
      (prisma.question.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB error'),
      );
      await expect(service.addQuestion(validDto)).rejects.toThrow(
        new InternalServerErrorException('Failed to add question'),
      );
    });
  });

  describe('getAllQuizzes', () => {
    it('should return quizzes successfully', async () => {
      const result = await service.getAllQuizzes('en', ['test']);
      expect(result).toEqual([mockQuiz]);
      expect(prisma.quiz.findMany).toHaveBeenCalledWith({
        where: {
          language: 'en',
          tags: { hasSome: ['test'] },
        },
        include: { questions: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle pagination parameters', async () => {
      await service.getAllQuizzes('en', ['test'], 2, 5);
      expect(prisma.quiz.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });

    it('should return empty array when no quizzes found', async () => {
      (prisma.quiz.findMany as jest.Mock).mockResolvedValueOnce([]);
      const result = await service.getAllQuizzes('fr');
      expect(result).toEqual([]);
    });

    it('should throw InternalServerErrorException on error', async () => {
      (prisma.quiz.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error'),
      );
      await expect(service.getAllQuizzes('en')).rejects.toThrow(
        new InternalServerErrorException('Failed to retrieve quizzes'),
      );
    });
  });

  describe('getQuizById', () => {
    it('should return a quiz by id', async () => {
      const result = await service.getQuizById('quiz-1');
      expect(result).toEqual(mockQuiz);
      expect(prisma.quiz.findUnique).toHaveBeenCalledWith({
        where: { id: 'quiz-1' },
        include: { questions: true },
      });
    });

    it('should throw BadRequestException for empty id', async () => {
      await expect(service.getQuizById('')).rejects.toThrow(
        new BadRequestException('Invalid quiz ID format'),
      );
    });

    it('should throw NotFoundException if quiz not found', async () => {
      (prisma.quiz.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.getQuizById('invalid-id')).rejects.toThrow(
        new NotFoundException('Quiz with id invalid-id not found'),
      );
    });

    it('should throw InternalServerErrorException on error', async () => {
      (prisma.quiz.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error'),
      );
      await expect(service.getQuizById('quiz-1')).rejects.toThrow(
        new InternalServerErrorException('Failed to retrieve quiz'),
      );
    });
  });

  describe('updateQuiz', () => {
    const validDto: UpdateQuizDto = { title: 'Updated Quiz' };

    it('should update quiz successfully', async () => {
      const result = await service.updateQuiz('quiz-1', validDto);
      expect(result).toEqual(mockQuiz);
      expect(prisma.quiz.update).toHaveBeenCalledWith({
        where: { id: 'quiz-1' },
        data: validDto,
      });
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.updateQuiz('', validDto)).rejects.toThrow(
        new BadRequestException('Invalid quiz ID format'),
      );
      await expect(service.updateQuiz(123 as any, validDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when quiz not found', async () => {
      (prisma.quiz.update as jest.Mock).mockRejectedValueOnce({
        code: 'P2025',
      });
      await expect(
        service.updateQuiz('non-existent-id', validDto),
      ).rejects.toThrow(
        new NotFoundException('Quiz with id non-existent-id not found'),
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      (prisma.quiz.update as jest.Mock).mockRejectedValueOnce(
        new Error('DB error'),
      );
      await expect(service.updateQuiz('quiz-1', validDto)).rejects.toThrow(
        new InternalServerErrorException('Failed to update quiz'),
      );
    });
  });

  describe('deleteQuiz', () => {
    const mockTransaction = jest.fn();

    beforeEach(() => {
      mockTransaction.mockReset();
      (prisma.$transaction as jest.Mock).mockImplementation(mockTransaction);
    });

    it('should delete quiz and its questions successfully', async () => {
      mockTransaction.mockImplementation(async (callback) => {
        await callback(prisma);
        return mockQuiz;
      });

      const result = await service.deleteQuiz('quiz-1');
      expect(result).toEqual(mockQuiz);

      expect(prisma.$transaction).toHaveBeenCalled();

      expect(prisma.question.deleteMany).toHaveBeenCalledWith({
        where: { quizId: 'quiz-1' },
      });
      expect(prisma.quiz.delete).toHaveBeenCalledWith({
        where: { id: 'quiz-1' },
      });
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.deleteQuiz('')).rejects.toThrow(
        new BadRequestException('Invalid quiz ID format'),
      );
      await expect(service.deleteQuiz(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when quiz not found', async () => {
      mockTransaction.mockRejectedValueOnce({
        code: 'P2025',
      });

      await expect(service.deleteQuiz('non-existent-id')).rejects.toThrow(
        new NotFoundException('Quiz with id non-existent-id not found'),
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      mockTransaction.mockRejectedValueOnce(new Error('DB error'));

      await expect(service.deleteQuiz('quiz-1')).rejects.toThrow(
        new InternalServerErrorException('Failed to delete quiz'),
      );
    });
  });

  describe('submitQuiz', () => {
    beforeEach(() => {
      // Default mocks for successful cases
      (prisma.client.findUnique as jest.Mock).mockResolvedValue(mockClient);
      jest
        .spyOn(service, 'getQuizById')
        .mockResolvedValue(mockQuizWithQuestions);
      (prisma.clientQuizAttempt.create as jest.Mock).mockResolvedValue(
        mockAttempt,
      );
    });

    it('should submit quiz successfully with provided score', async () => {
      const dto: SubmitQuizDto = {
        quizId: 'quiz-1',
        answers: ['4', '6', '8'],
        score: 3,
      };

      const result = await service.submitQuiz('client-1', dto);
      expect(result).toEqual(mockAttempt);
      // Should not calculate score when provided
      expect(service.getQuizById).not.toHaveBeenCalled();
    });

    it('should calculate score automatically when not provided', async () => {
      const dto: SubmitQuizDto = {
        quizId: 'quiz-1',
        answers: ['4', '6', '8'],
        score: 0,
      };

      (prisma.clientQuizAttempt.create as jest.Mock).mockResolvedValueOnce({
        ...mockAttempt,
        score: 3,
      });

      const result = await service.submitQuiz('client-1', dto);
      expect(result.score).toBe(3);
      expect(service.getQuizById).toHaveBeenCalledWith('quiz-1');
    });

    it('should calculate partial score correctly', async () => {
      const dto: SubmitQuizDto = {
        quizId: 'quiz-1',
        answers: ['4', 'wrong', '8'],
        score: 0,
      };

      (prisma.clientQuizAttempt.create as jest.Mock).mockResolvedValueOnce({
        ...mockAttempt,
        score: 2,
      });

      const result = await service.submitQuiz('client-1', dto);
      expect(result.score).toBe(2);
    });

    it('should use provided score instead of calculating', async () => {
      const dto: SubmitQuizDto = {
        quizId: 'quiz-1',
        answers: ['wrong', 'answers', 'here'],
        score: 100,
      };

      (prisma.clientQuizAttempt.create as jest.Mock).mockResolvedValueOnce({
        ...mockAttempt,
        score: 100,
      });

      const result = await service.submitQuiz('client-1', dto);
      expect(result.score).toBe(100);
      expect(service.getQuizById).not.toHaveBeenCalled();
    });

    it('should handle case-insensitive answers', async () => {
      const dto: SubmitQuizDto = {
        quizId: 'quiz-1',
        answers: ['4', 'SIX', 'EIGHT'],
        score: 0,
      };

      (prisma.clientQuizAttempt.create as jest.Mock).mockResolvedValueOnce({
        ...mockAttempt,
        score: 3,
      });

      const result = await service.submitQuiz('client-1', dto);
      expect(result.score).toBe(3);
    });

    it('should handle fewer answers than questions', async () => {
      const dto: SubmitQuizDto = {
        quizId: 'quiz-1',
        answers: ['4'],
        score: 0,
      };

      (prisma.clientQuizAttempt.create as jest.Mock).mockResolvedValueOnce({
        ...mockAttempt,
        score: 1,
      });

      const result = await service.submitQuiz('client-1', dto);
      expect(result.score).toBe(1);
    });

    it('should handle more answers than questions', async () => {
      const dto: SubmitQuizDto = {
        quizId: 'quiz-1',
        answers: ['4', '6', '8', 'extra-answer'],
        score: 0,
      };

      (prisma.clientQuizAttempt.create as jest.Mock).mockResolvedValueOnce({
        ...mockAttempt,
        score: 3,
      });

      const result = await service.submitQuiz('client-1', dto);
      expect(result.score).toBe(3);
    });

    it('should throw BadRequestException if quiz has no questions', async () => {
      jest.spyOn(service, 'getQuizById').mockResolvedValueOnce({
        ...mockQuiz,
        questions: [],
      });

      const dto: SubmitQuizDto = {
        quizId: 'quiz-1',
        answers: ['4', '6', '8'],
        score: 0,
      };

      await expect(service.submitQuiz('client-1', dto)).rejects.toThrow(
        new BadRequestException('Quiz has no questions'),
      );
    });

    it('should throw BadRequestException for invalid clientId format', async () => {
      const dto: SubmitQuizDto = {
        quizId: 'quiz-1',
        answers: ['4', '6', '8'],
        score: 0,
      };

      await expect(service.submitQuiz('', dto)).rejects.toThrow(
        new BadRequestException('Invalid client ID format'),
      );

      await expect(service.submitQuiz(123 as any, dto)).rejects.toThrow(
        new BadRequestException('Invalid client ID format'),
      );
    });

    it('should throw BadRequestException if quizId missing', async () => {
      const invalidDto = { answers: ['test'] } as SubmitQuizDto;
      await expect(service.submitQuiz('client-1', invalidDto)).rejects.toThrow(
        new BadRequestException('Quiz ID and answers are required'),
      );
    });

    it('should throw BadRequestException if answers missing', async () => {
      const invalidDto = { quizId: 'quiz-1' } as SubmitQuizDto;
      await expect(service.submitQuiz('client-1', invalidDto)).rejects.toThrow(
        new BadRequestException('Quiz ID and answers are required'),
      );
    });

    it('should throw NotFoundException if client not found', async () => {
      (prisma.client.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const dto: SubmitQuizDto = {
        quizId: 'quiz-1',
        answers: ['4', '6', '8'],
        score: 0,
      };

      await expect(service.submitQuiz('invalid-client', dto)).rejects.toThrow(
        new NotFoundException('Client with id invalid-client not found'),
      );
    });

    it('should throw NotFoundException if quiz not found', async () => {
      jest
        .spyOn(service, 'getQuizById')
        .mockRejectedValueOnce(
          new NotFoundException('Quiz with id invalid-quiz not found'),
        );

      const dto: SubmitQuizDto = {
        quizId: 'invalid-quiz',
        answers: ['4', '6', '8'],
        score: 0,
      };

      await expect(service.submitQuiz('client-1', dto)).rejects.toThrow(
        new NotFoundException('Quiz with id invalid-quiz not found'),
      );
    });

    it('should throw InternalServerErrorException on DB error', async () => {
      (prisma.clientQuizAttempt.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB failure'),
      );

      const dto: SubmitQuizDto = {
        quizId: 'quiz-1',
        answers: ['4', '6', '8'],
        score: 0,
      };

      await expect(service.submitQuiz('client-1', dto)).rejects.toThrow(
        new InternalServerErrorException('Failed to submit quiz'),
      );
    });
  });

  describe('getQuizSuggestionsFromAI', () => {
    const expectedSuggestions = ['quiz-1', 'quiz-2'];

    it('should return AI suggestions successfully', async () => {
      const result = await service.getQuizSuggestionsFromAI('client-1');
      expect(result).toEqual(expectedSuggestions);
    });

    it('should throw BadRequestException for empty clientId', async () => {
      await expect(service.getQuizSuggestionsFromAI('')).rejects.toThrow(
        new BadRequestException('Invalid client ID format'),
      );
    });

    it('should throw NotFoundException if client not found', async () => {
      (prisma.client.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(
        service.getQuizSuggestionsFromAI('invalid-client'),
      ).rejects.toThrow(
        new NotFoundException('Client with id invalid-client not found'),
      );
    });

    it('should throw InternalServerErrorException on AI service error', async () => {
      (aiService.generateQuizSuggestions as jest.Mock).mockRejectedValueOnce(
        new Error('AI error'),
      );
      await expect(
        service.getQuizSuggestionsFromAI('client-1'),
      ).rejects.toThrow(
        new InternalServerErrorException('Failed to get AI quiz suggestions'),
      );
    });
  });
});
