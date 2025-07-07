import { Test, TestingModule } from '@nestjs/testing';
import { LearningService } from './learning.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateLearningContentDto } from './dto/create-learning-content.dto';
import { UpdateLearningContentDto } from './dto/update-learning-content.dto';
import { RecordProgressDto } from './dto/record-progress.dto';

describe('LearningService', () => {
  let service: LearningService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningService,
        {
          provide: PrismaService,
          useValue: {
            learningContent: {
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            learningProgress: {
              upsert: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LearningService>(LearningService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  const sampleCreateDto: CreateLearningContentDto = {
    title: 'Intro to AI',
    type: 'video',
    url: 'http://example.com/ai',
    description: 'Learn AI basics',
    language: 'en',
    tags: ['AI', 'ML'],
  };

  const sampleUpdateDto: UpdateLearningContentDto = {
    title: 'Advanced AI',
  };

  const sampleRecordDto: RecordProgressDto = {
    contentId: 'content-1',
    completion: 80,
    clientId: 'client-1'
  };

  describe('create', () => {
    it('should create learning content successfully', async () => {
      (prisma.learningContent.create as jest.Mock).mockResolvedValue({
        id: 'content-1',
        ...sampleCreateDto,
      });

      const result = await service.create(sampleCreateDto, 'creator-1');
      expect(result).toEqual({ id: 'content-1', ...sampleCreateDto });
      expect(prisma.learningContent.create).toHaveBeenCalledWith({
        data: { ...sampleCreateDto, createdById: 'creator-1' },
      });
    });

    it('should throw BadRequestException if required fields missing', async () => {
      const invalidDto = { ...sampleCreateDto, title: '', url: '' };
      await expect(service.create(invalidDto, 'creator-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException on duplicate entry', async () => {
      const error: any = new Error('Duplicate content');
      error.code = 'P2002'; 

      (prisma.learningContent.create as jest.Mock).mockRejectedValue(error);

      await expect(
        service.create(sampleCreateDto, 'creator-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update content successfully', async () => {
      (prisma.learningContent.update as jest.Mock).mockResolvedValue({
        id: 'content-1',
        ...sampleUpdateDto,
      });

      const result = await service.update('content-1', sampleUpdateDto);
      expect(result).toEqual({ id: 'content-1', ...sampleUpdateDto });
    });

    it('should throw NotFoundException if content not found', async () => {
      const error: any = new Error('Content not found');
      error.code = 'P2025'; 

      (prisma.learningContent.update as jest.Mock).mockRejectedValue(error);

      await expect(
        service.update('invalid-id', sampleUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return filtered contents', async () => {
      const mockData = [{ id: '1' }, { id: '2' }];
      (prisma.learningContent.findMany as jest.Mock).mockResolvedValue(
        mockData,
      );

      const result = await service.findAll('en', ['AI']);
      expect(result).toEqual(mockData);
      expect(prisma.learningContent.findMany).toHaveBeenCalledWith({
        where: { language: 'en', tags: { hasSome: ['AI'] } },
      });
    });

    it('should return contents with no filters', async () => {
      (prisma.learningContent.findMany as jest.Mock).mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return content by id', async () => {
      (prisma.learningContent.findUnique as jest.Mock).mockResolvedValue({
        id: 'content-1',
      });

      const result = await service.findOne('content-1');
      expect(result).toEqual({ id: 'content-1' });
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findOne(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if content not found', async () => {
      (prisma.learningContent.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByClientProfile', () => {
    it('should return personalized contents', async () => {
      const profile = {
        preferredLanguage: 'en',
        goals: ['AI'],
        occupation: 'developer',
        investmentExperience: 'beginner',
      };
      const mockData = [{ id: 'content-1' }];

      (prisma.learningContent.findMany as jest.Mock).mockResolvedValue(
        mockData,
      );

      const result = await service.findByClientProfile(profile);
      expect(result).toEqual(mockData);
      expect(prisma.learningContent.findMany).toHaveBeenCalled();
    });
  });

  describe('recordProgress', () => {
    it('should throw BadRequestException for invalid completion', async () => {
      await expect(
        service.recordProgress('client-1', {
          contentId: 'content-1',
          completion: 120,
          clientId: ''
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if content not found', async () => {
      (prisma.learningContent.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.recordProgress('client-1', sampleRecordDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should upsert progress successfully', async () => {
      (prisma.learningContent.findUnique as jest.Mock).mockResolvedValue({
        id: 'content-1',
      });
      (prisma.learningProgress.upsert as jest.Mock).mockResolvedValue({
        id: 'progress-1',
      });

      const result = await service.recordProgress('client-1', sampleRecordDto);
      expect(result).toEqual({ id: 'progress-1' });
    });
  });

  describe('getClientProgress', () => {
    it('should return client progress with content', async () => {
      const mockData = [{ id: 'progress-1', content: { id: 'content-1' } }];
      (prisma.learningProgress.findMany as jest.Mock).mockResolvedValue(
        mockData,
      );

      const result = await service.getClientProgress('client-1');
      expect(result).toEqual(mockData);
    });

    it('should throw InternalServerErrorException on failure', async () => {
      (prisma.learningProgress.findMany as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.getClientProgress('client-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
