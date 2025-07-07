import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentService } from './investment.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { BulkCreateInvestmentDto } from './dto/bulk-create-investment.dto';

describe('InvestmentService', () => {
  let service: InvestmentService;
  let prisma: PrismaService;

  const mockPrismaService = {
    investment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestmentService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InvestmentService>(InvestmentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    (Logger.prototype.error as jest.Mock).mockRestore();
  });

  describe('create', () => {
    it('should create an investment', async () => {
      const dto: CreateInvestmentDto = {
        amount: 1000,
        clientId: '123',
        type: 'stocks',
        startDate: '',
        status: '',
      };
      const result = { id: '1', ...dto };
      (prisma.investment.create as jest.Mock).mockResolvedValue(result);

      expect(await service.create(dto)).toEqual(result);
      expect(prisma.investment.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw BadRequestException on duplicate entry', async () => {
      const error = {
        code: 'P2002',
        message: 'Duplicate entry',
        name: 'PrismaClientKnownRequestError',
      };
      (prisma.investment.create as jest.Mock).mockRejectedValue(error);

      await expect(service.create({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException on invalid foreign key', async () => {
      const error = {
        code: 'P2003',
        message: 'Foreign key constraint failed',
        name: 'PrismaClientKnownRequestError',
      };
      (prisma.investment.create as jest.Mock).mockRejectedValue(error);

      await expect(service.create({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on unknown error', async () => {
      (prisma.investment.create as jest.Mock).mockRejectedValue(
        new Error('Unknown'),
      );
      await expect(service.create({} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('bulkCreate', () => {
    it('should create investments in bulk', async () => {
      const dto: BulkCreateInvestmentDto = {
        investments: [
          {
            amount: 1000,
            clientId: '123',
            type: 'stocks',
            startDate: '',
            status: '',
          },
        ],
      };
      (prisma.investment.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...(dto.investments && dto.investments[0] ? dto.investments[0] : {}),
      });

      const result = await service.bulkCreate(dto);
      expect(result).toHaveLength(1);
      expect(prisma.investment.create).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException for invalid input', async () => {
      await expect(service.bulkCreate({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on failure', async () => {
      (prisma.investment.create as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );
      const dto: BulkCreateInvestmentDto = {
        investments: [
          {
            amount: 1000,
            clientId: '123',
            type: 'stocks',
            startDate: '',
            status: '',
          },
        ],
      };
      await expect(service.bulkCreate(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAllByClient', () => {
    it('should return investments for a client', async () => {
      const result = [{ id: '1', clientId: '123', amount: 1000 }];
      (prisma.investment.findMany as jest.Mock).mockResolvedValue(result);

      expect(await service.findAllByClient('123')).toEqual(result);
      expect(prisma.investment.findMany).toHaveBeenCalledWith({
        where: { clientId: '123', status: undefined },
      });
    });

    it('should throw BadRequestException for invalid clientId', async () => {
      await expect(service.findAllByClient(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on failure', async () => {
      (prisma.investment.findMany as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );
      await expect(service.findAllByClient('123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return an investment by ID', async () => {
      const result = { id: '1', clientId: '123', amount: 1000 };
      (prisma.investment.findUnique as jest.Mock).mockResolvedValue(result);

      expect(await service.findOne('1')).toEqual(result);
      expect(prisma.investment.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.findOne(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if investment not found', async () => {
      (prisma.investment.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on failure', async () => {
      (prisma.investment.findUnique as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );
      await expect(service.findOne('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update an investment', async () => {
      const dto: UpdateInvestmentDto = { amount: 1500 };
      const result = { id: '1', ...dto };
      (prisma.investment.update as jest.Mock).mockResolvedValue(result);

      expect(await service.update('1', dto)).toEqual(result);
      expect(prisma.investment.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: dto,
      });
    });

    it('should throw BadRequestException on duplicate entry', async () => {
      const error = {
        code: 'P2002',
        message: 'Duplicate entry',
        name: 'PrismaClientKnownRequestError',
      };
      (prisma.investment.update as jest.Mock).mockRejectedValue(error);

      await expect(service.update('1', {} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if investment not found', async () => {
      const error = {
        code: 'P2025',
        message: 'Record not found',
        name: 'PrismaClientKnownRequestError',
      };
      (prisma.investment.update as jest.Mock).mockRejectedValue(error);

      await expect(service.update('1', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on failure', async () => {
      (prisma.investment.update as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );
      await expect(service.update('1', {} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.update(null as any, {} as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should delete an investment', async () => {
      const result = { id: '1', deleted: true };
      (prisma.investment.delete as jest.Mock).mockResolvedValue(result);

      expect(await service.remove('1')).toEqual(result);
      expect(prisma.investment.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if investment not found', async () => {
      const error = {
        code: 'P2025',
        message: 'Record not found',
        name: 'PrismaClientKnownRequestError',
      };
      (prisma.investment.delete as jest.Mock).mockRejectedValue(error);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on failure', async () => {
      (prisma.investment.delete as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );
      await expect(service.remove('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.remove(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByClientAndTypes', () => {
    it('should return investments filtered by client ID and types', async () => {
      const result = [{ id: '1', clientId: '123', type: 'stocks' }];
      (prisma.investment.findMany as jest.Mock).mockResolvedValue(result);

      expect(await service.findByClientAndTypes('123', ['stocks'])).toEqual(
        result,
      );
      expect(prisma.investment.findMany).toHaveBeenCalledWith({
        where: { clientId: '123', type: { in: ['stocks'] } },
      });
    });

    it('should throw BadRequestException for invalid clientId', async () => {
      await expect(
        service.findByClientAndTypes(null as any, ['stocks']),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty types array', async () => {
      await expect(service.findByClientAndTypes('123', [])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on failure', async () => {
      (prisma.investment.findMany as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );
      await expect(
        service.findByClientAndTypes('123', ['stocks']),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
