import { Test, TestingModule } from '@nestjs/testing';
import { LearningService } from './learning.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateLearningContentDto } from './dto/create-learning-content.dto';
import { RecordProgressDto } from './dto/record-progress.dto';

describe('LearningService', () => {
  let service: LearningService;
  let prisma: PrismaService;

  const mockPrisma = {
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LearningService>(LearningService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create content', async () => {
    const dto: CreateLearningContentDto = {
      title: 'Intro to TypeScript',
      description: 'A beginner-friendly guide.',
      url: 'https://example.com/video.mp4',
      type: 'video',
      language: 'en',
      tags: ['typescript', 'beginner'],
    };

    const created = { ...dto, id: '1' };
    mockPrisma.learningContent.create.mockResolvedValue(created);

    const result = await service.create(dto, 'user-123');

    expect(mockPrisma.learningContent.create).toHaveBeenCalledWith({
      data: {
        ...dto,
        createdById: 'user-123',
      },
    });
    expect(result).toEqual(created);
  });

  it('should update content', async () => {
    const dto = { title: 'Updated Title' };
    const updated = { id: '1', ...dto };
    mockPrisma.learningContent.update.mockResolvedValue(updated);

    const result = await service.update('1', dto);
    expect(result).toEqual(updated);
  });

  it('should find all content with filters', async () => {
    mockPrisma.learningContent.findMany.mockResolvedValue([]);
    const result = await service.findAll('en', ['finance']);
    expect(mockPrisma.learningContent.findMany).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should find content by id', async () => {
    mockPrisma.learningContent.findUnique.mockResolvedValue({ id: '1' });
    const result = await service.findOne('1');
    expect(result).toEqual({ id: '1' });
  });

  it('should throw if content not found', async () => {
    mockPrisma.learningContent.findUnique.mockResolvedValue(null);
    await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
  });

  it('should find by client profile', async () => {
    const profile = {
      preferredLanguage: 'en',
      goals: ['education'],
      occupation: 'teacher',
      investmentExperience: 'beginner',
    };

    mockPrisma.learningContent.findMany.mockResolvedValue([]);
    const result = await service.findByClientProfile(profile);
    expect(result).toEqual([]);
  });

  it('should record progress', async () => {
    const dto: RecordProgressDto = {
      clientId: 'user-123',
      contentId: '1',
      completion: 80,
    };

    const expected = {
      clientId: 'user-123',
      contentId: '1',
      progress: 80,
      lastAccessedAt: expect.any(Date),
    };

    mockPrisma.learningProgress.upsert.mockResolvedValue(expected);

    const result = await service.recordProgress('user-123', dto);

    expect(mockPrisma.learningProgress.upsert).toHaveBeenCalledWith({
      where: {
        clientId_contentId: {
          clientId: 'user-123',
          contentId: '1',
        },
      },
      update: {
        progress: 80,
        lastAccessedAt: expect.any(Date),
      },
      create: {
        clientId: 'user-123',
        contentId: '1',
        progress: 80,
        lastAccessedAt: expect.any(Date),
      },
    });

    expect(result).toEqual(expected);
  });

  it('should return client progress list', async () => {
    mockPrisma.learningProgress.findMany.mockResolvedValue([]);
    const result = await service.getClientProgress('user-123');
    expect(result).toEqual([]);
  });
});
