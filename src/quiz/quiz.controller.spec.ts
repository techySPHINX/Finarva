import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { AddQuestionDto } from './dto/add-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('QuizController', () => {
  let controller: QuizController;
  let service: QuizService;

  const mockQuizService = {
    createQuiz: jest.fn(),
    addQuestion: jest.fn(),
    getAllQuizzes: jest.fn(),
    getQuizById: jest.fn(),
    updateQuiz: jest.fn(),
    deleteQuiz: jest.fn(),
    submitQuiz: jest.fn(),
    getAttemptsByClient: jest.fn(),
    getQuizSuggestionsFromAI: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [{ provide: QuizService, useValue: mockQuizService }],
    }).compile();

    controller = module.get<QuizController>(QuizController);
    service = module.get<QuizService>(QuizService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create a quiz', async () => {
      const dto: CreateQuizDto = { title: 'Test Quiz', language: 'en' };
      const req: any = { user: { id: 'agent-id' } };

      mockQuizService.createQuiz.mockResolvedValue({ id: 'quiz-id', ...dto });

      const result = await controller.create(dto, req);
      expect(result).toEqual({ id: 'quiz-id', ...dto });
      expect(mockQuizService.createQuiz).toHaveBeenCalledWith(dto, 'agent-id');
    });

    it('should throw InternalServerErrorException on failure', async () => {
      const dto: CreateQuizDto = { title: 'Test Quiz', language: 'en' };
      const req: any = { user: { id: 'agent-id' } };

      mockQuizService.createQuiz.mockRejectedValue(new Error('Failed'));

      await expect(controller.create(dto, req)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('addQuestion', () => {
    it('should add a question to a quiz', async () => {
      const dto: AddQuestionDto = {
        quizId: 'quiz-id',
        question: 'What is AI?',
        answer: 'Artificial Intelligence',
        options: [],
        language: ''
      };
      mockQuizService.addQuestion.mockResolvedValue({
        id: 'question-id',
        ...dto,
      });

      const result = await controller.addQuestion(dto);
      expect(result).toEqual({ id: 'question-id', ...dto });
    });
  });

  describe('findAll', () => {
    it('should return all quizzes', async () => {
      mockQuizService.getAllQuizzes.mockResolvedValue(['quiz1', 'quiz2']);
      const result = await controller.findAll(
        'en',
        'insurance,investment',
        '1',
        '10',
      );
      expect(result).toEqual(['quiz1', 'quiz2']);
    });
  });

  describe('findOne', () => {
    it('should return a quiz by id', async () => {
      mockQuizService.getQuizById.mockResolvedValue({ id: 'quiz-id' });
      const result = await controller.findOne('quiz-id');
      expect(result).toEqual({ id: 'quiz-id' });
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(controller.findOne(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a quiz', async () => {
      const dto: UpdateQuizDto = { title: 'Updated' };
      mockQuizService.updateQuiz.mockResolvedValue({ id: 'quiz-id', ...dto });

      const result = await controller.update('quiz-id', dto);
      expect(result).toEqual({ id: 'quiz-id', ...dto });
    });
  });

  describe('delete', () => {
    it('should delete a quiz', async () => {
      mockQuizService.deleteQuiz.mockResolvedValue({ id: 'quiz-id' });
      const result = await controller.delete('quiz-id');
      expect(result).toEqual({ id: 'quiz-id' });
    });
  });

  describe('submit', () => {
    it('should submit a quiz', async () => {
      const dto: SubmitQuizDto = {
        quizId: 'quiz-id', answers: ['A'],
        score: 0
      };
      const req: any = { user: { id: 'client-id' } };

      mockQuizService.submitQuiz.mockResolvedValue({
        id: 'attempt-id',
        ...dto,
      });

      const result = await controller.submit(req, dto);
      expect(result).toEqual({ id: 'attempt-id', ...dto });
    });
  });

  describe('attempts', () => {
    it('should return quiz attempts for a client', async () => {
      const req: any = { user: { id: 'client-id' } };
      mockQuizService.getAttemptsByClient.mockResolvedValue(['attempt1']);

      const result = await controller.attempts(req, '1', '10');
      expect(result).toEqual(['attempt1']);
    });
  });

  describe('getSuggestionsFromAI', () => {
    it('should return AI suggestions', async () => {
      const req: any = { user: { id: 'client-id' } };
      mockQuizService.getQuizSuggestionsFromAI.mockResolvedValue([
        'suggestion',
      ]);

      const result = await controller.getSuggestionsFromAI(req);
      expect(result).toEqual(['suggestion']);
    });
  });
});
