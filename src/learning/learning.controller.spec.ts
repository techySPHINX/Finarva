import { Test, TestingModule } from '@nestjs/testing';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLearningContentDto } from './dto/create-learning-content.dto';
import { RecordProgressDto } from './dto/record-progress.dto';

describe('LearningController', () => {
  let controller: LearningController;
  let service: LearningService;

  const mockLearningService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    recordProgress: jest.fn(),
    findByClientProfile: jest.fn(),
  };

  const mockUser = { user: { id: 'user-123' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningController],
      providers: [
        {
          provide: LearningService,
          useValue: mockLearningService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LearningController>(LearningController);
    service = module.get<LearningService>(LearningService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create learning content', async () => {
    const dto: CreateLearningContentDto = {
      title: 'Test',
      description: 'Test Desc',
      url: 'http://test.com',
      type: 'video',
      language: 'en',
      tags: ['finance'],
    };

    mockLearningService.create.mockResolvedValue({ ...dto, id: '1' });

    const result = await controller.create(dto, mockUser);
    expect(service.create).toHaveBeenCalledWith(dto, mockUser.user.id);
    expect(result).toEqual({ ...dto, id: '1' });
  });

  it('should fetch all content', async () => {
    mockLearningService.findAll.mockResolvedValue([]);
    const result = await controller.findAll('en', 'finance,insurance');
    expect(service.findAll).toHaveBeenCalledWith('en', [
      'finance',
      'insurance',
    ]);
    expect(result).toEqual([]);
  });

  it('should fetch content by ID', async () => {
    mockLearningService.findOne.mockResolvedValue({ id: '1', title: 'Test' });
    const result = await controller.findOne('1');
    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1', title: 'Test' });
  });

  it('should record progress', async () => {
    const dto: RecordProgressDto = {
      clientId: 'user-123',
      contentId: '1',
      completion: 80,
    };

    mockLearningService.recordProgress.mockResolvedValue(dto);

    const result = await controller.recordProgress('1', dto);

    expect(service.recordProgress).toHaveBeenCalledWith('user-123', dto);
    expect(result).toEqual(dto);
  });

  it('should fetch by client profile', async () => {
    mockLearningService.findByClientProfile.mockResolvedValue([]);
    const result = await controller.findByClientProfile(
      'en',
      'retirement',
      'engineer',
      'beginner',
    );
    expect(service.findByClientProfile).toHaveBeenCalledWith({
      preferredLanguage: 'en',
      goals: ['retirement'],
      occupation: 'engineer',
      investmentExperience: 'beginner',
    });
    expect(result).toEqual([]);
  });
});
