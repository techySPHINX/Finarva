import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

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

  const mockReq = {
    user: { id: 'user123' },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [{ provide: QuizService, useValue: mockQuizService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<QuizController>(QuizController);
    service = module.get<QuizService>(QuizService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a quiz', async () => {
    const dto: CreateQuizDto = {
      title: 'Test',
      tags: ['test'],
      language: 'en',
    };
    await controller.create(dto, mockReq);
    expect(mockQuizService.createQuiz).toHaveBeenCalledWith(dto, 'user123');
  });

  it('should submit a quiz', async () => {
    const dto: SubmitQuizDto = {
      quizId: 'quiz1',
      answers: ['a', 'b'],
      score: 2,
    };
    await controller.submit(mockReq, dto);
    expect(mockQuizService.submitQuiz).toHaveBeenCalledWith('user123', dto);
  });

  it('should get all quizzes', async () => {
    await controller.findAll('en', 'tag1,tag2', '1', '10');
    expect(mockQuizService.getAllQuizzes).toHaveBeenCalledWith(
      'en',
      ['tag1', 'tag2'],
      1,
      10,
    );
  });
});
