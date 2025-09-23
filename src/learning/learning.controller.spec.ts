import { Test, TestingModule } from '@nestjs/testing';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';
import { CreateLearningContentDto } from './dto/create-learning-content.dto';
import { RecordProgressDto } from './dto/record-progress.dto';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';

describe('LearningController', () => {
  let controller: LearningController;
  let service: LearningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningController],
      providers: [
        {
          provide: LearningService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByClientProfile: jest.fn(),
            findOne: jest.fn(),
            recordProgress: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LearningController>(LearningController);
    service = module.get<LearningService>(LearningService);
  });

  const sampleCreateDto: CreateLearningContentDto = {
    title: 'AI Basics',
    type: 'video',
    url: 'http://example.com/ai',
    description: 'Intro to AI',
    language: 'en',
    tags: ['AI', 'ML'],
  };

  const sampleRecordDto: RecordProgressDto = {
    clientId: 'client-1',
    completion: 80,
    contentId: 'content-1',
  };

  describe('create', () => {
    it('should create learning content successfully', async () => {
      const mockResult = { id: 'content-1', ...sampleCreateDto };
      (service.create as jest.Mock).mockResolvedValue(mockResult);

      const req = { user: { id: 'creator-1' } };
      const result = await controller.create(sampleCreateDto, req as any);
      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith(sampleCreateDto, 'creator-1');
    });

    it('should throw InternalServerErrorException on unhandled error', async () => {
      (service.create as jest.Mock).mockRejectedValue(new Error('DB error'));
      const req = { user: { id: 'creator-1' } };

      await expect(
        controller.create(sampleCreateDto, req as any),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should propagate BadRequestException or ConflictException', async () => {
      (service.create as jest.Mock).mockRejectedValue(
        new BadRequestException('Invalid'),
      );

      const req = { user: { id: 'creator-1' } };
      await expect(
        controller.create(sampleCreateDto, req as any),
      ).rejects.toThrow(BadRequestException);

      (service.create as jest.Mock).mockRejectedValue(
        new ConflictException('Duplicate'),
      );

      await expect(
        controller.create(sampleCreateDto, req as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all learning contents with filters', async () => {
      const mockData = [{ id: '1' }, { id: '2' }];
      (service.findAll as jest.Mock).mockResolvedValue(mockData);

      const result = await controller.findAll('en', 'AI,ML');
      expect(result).toEqual(mockData);
      expect(service.findAll).toHaveBeenCalledWith('en', ['AI', 'ML']);
    });

    it('should handle errors with InternalServerErrorException', async () => {
      (service.findAll as jest.Mock).mockRejectedValue(new Error('DB error'));
      await expect(controller.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findByClientProfile', () => {
    it('should call findByClientProfile service method with correct parameters', async () => {
      const mockData = [{ id: 'content-1' }];
      (service.findByClientProfile as jest.Mock).mockResolvedValue(mockData);

      const language = 'en';
      const goals = 'retirement,education';
      const occupation = 'engineer';
      const investmentExperience = 'intermediate';

      const result = await controller.findByClientProfile(
        language,
        goals,
        occupation,
        investmentExperience,
      );

      expect(service.findByClientProfile).toHaveBeenCalledWith({
        preferredLanguage: language,
        goals: ['retirement', 'education'],
        occupation: occupation,
        investmentExperience: investmentExperience,
      });
      expect(result).toEqual(mockData);
    });

    it('should handle empty query parameters', async () => {
      const mockData = [{ id: 'content-2' }];
      (service.findByClientProfile as jest.Mock).mockResolvedValue(mockData);

      const result = await controller.findByClientProfile();

      expect(service.findByClientProfile).toHaveBeenCalledWith({
        goals: [],
      });
      expect(result).toEqual(mockData);
    });

    it('should throw InternalServerErrorException on failure', async () => {
      (service.findByClientProfile as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        controller.findByClientProfile('en', 'AI', 'dev', 'beginner'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return content by id', async () => {
      (service.findOne as jest.Mock).mockResolvedValue({ id: 'content-1' });
      const result = await controller.findOne('content-1');
      expect(result).toEqual({ id: 'content-1' });
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(controller.findOne(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should propagate NotFoundException', async () => {
      (service.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException('Not found'),
      );

      await expect(controller.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      (service.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(controller.findOne('content-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('recordProgress', () => {
    it('should record progress successfully', async () => {
      (service.recordProgress as jest.Mock).mockResolvedValue({
        id: 'progress-1',
      });

      const result = await controller.recordProgress(
        'content-1',
        sampleRecordDto,
      );
      expect(result).toEqual({ id: 'progress-1' });
    });

    it('should throw BadRequestException for invalid contentId', async () => {
      await expect(
        controller.recordProgress(null as any, sampleRecordDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid clientId', async () => {
      await expect(
        controller.recordProgress('content-1', {
          ...sampleRecordDto,
          clientId: null as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid completion', async () => {
      await expect(
        controller.recordProgress('content-1', {
          ...sampleRecordDto,
          completion: 120,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should propagate NotFoundException', async () => {
      (service.recordProgress as jest.Mock).mockRejectedValue(
        new NotFoundException('Not found'),
      );

      await expect(
        controller.recordProgress('content-1', sampleRecordDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      (service.recordProgress as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        controller.recordProgress('content-1', sampleRecordDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
