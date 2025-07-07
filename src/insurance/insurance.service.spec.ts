import { Test, TestingModule } from '@nestjs/testing';
import { InsuranceService } from './insurance.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateInsuranceDto } from './dto/create-insurance.dto';

describe('InsuranceService', () => {
  let service: InsuranceService;
  let prisma: PrismaService;
  let aiService: AiService;

  const mockInsurance = {
    id: '1',
    type: 'Life',
    coverageAmount: 100000,
    premium: 100,
    startDate: new Date(),
    endDate: new Date(),
    clientId: 'client-1',
    status: 'active',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsuranceService,
        {
          provide: PrismaService,
          useValue: {
            insurance: {
              create: jest.fn().mockResolvedValue(mockInsurance),
              findMany: jest.fn().mockResolvedValue([mockInsurance]),
              findUnique: jest.fn().mockResolvedValue(mockInsurance),
              update: jest.fn().mockResolvedValue(mockInsurance),
              delete: jest.fn().mockResolvedValue(mockInsurance),
            },
          },
        },
        {
          provide: AiService,
          useValue: {
            suggestInsurance: jest
              .fn()
              .mockResolvedValue('Suggested insurance'),
          },
        },
      ],
    }).compile();

    service = module.get<InsuranceService>(InsuranceService);
    prisma = module.get<PrismaService>(PrismaService);
    aiService = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create insurance successfully', async () => {
      const result = await service.create({} as CreateInsuranceDto);
      expect(result).toEqual(mockInsurance);
    });

    it('should throw ConflictException on P2002 error', async () => {
      (prisma.insurance.create as jest.Mock).mockRejectedValueOnce({ code: 'P2002' });
      await expect(service.create({} as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException on P2003 error', async () => {
      (prisma.insurance.create as jest.Mock).mockRejectedValueOnce({ code: 'P2003' });
      await expect(service.create({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      (prisma.insurance.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
      await expect(service.create({} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update insurance successfully', async () => {
      const result = await service.update('1', {});
      expect(result).toEqual(mockInsurance);
    });

    it('should throw NotFoundException on P2025 error', async () => {
      (prisma.insurance.update as jest.Mock).mockRejectedValueOnce({ code: 'P2025' });
      await expect(service.update('1', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on P2002 error', async () => {
      (prisma.insurance.update as jest.Mock).mockRejectedValueOnce({ code: 'P2002' });
      await expect(service.update('1', {})).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      (prisma.insurance.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
      await expect(service.update('1', {})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should remove insurance successfully', async () => {
      const result = await service.remove('1');
      expect(result).toEqual(mockInsurance);
    });

    it('should throw NotFoundException on P2025 error', async () => {
      (prisma.insurance.delete as jest.Mock).mockRejectedValueOnce({ code: 'P2025' });
      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      (prisma.insurance.delete as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
      await expect(service.remove('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // Add tests for other methods (findAll, findAllByClient, etc.)
});
