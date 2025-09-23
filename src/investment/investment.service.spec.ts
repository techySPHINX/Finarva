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
import { PaginationDto } from '../common/dto/pagination.dto';

const investmentMock = {
  create: jest.fn(),
  createMany: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const prismaMock = {
  primary: {
    investment: investmentMock,
    $transaction: jest.fn(),
  },
  readReplica: {
    investment: investmentMock,
  },
};

describe('InvestmentService', () => {
  let service: InvestmentService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestmentService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<InvestmentService>(InvestmentService);
    prisma = module.get<PrismaService>(PrismaService) as any;
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
    jest.clearAllMocks();
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
        startDate: new Date().toISOString(),
        status: 'active',
      };
      const result = { id: '1', ...dto, createdAt: new Date(), updatedAt: new Date(), returns: null, source: null };
      (prisma.primary.investment.create as jest.Mock).mockResolvedValue(result);

      expect(await service.create(dto)).toEqual(result);
      expect(prisma.primary.investment.create).toHaveBeenCalledWith({ data: dto });
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
            startDate: new Date().toISOString(),
            status: 'active',
          },
        ],
      };
      (prisma.primary.investment.createMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await service.bulkCreate(dto);
      expect(result.count).toEqual(1);
      expect(prisma.primary.investment.createMany).toHaveBeenCalledWith({
        data: dto.investments,
      });
    });
  });

  describe('findAllByClient', () => {
    it('should return investments for a client', async () => {
      const result = [{ id: '1', clientId: '123', amount: 1000, type: 'a', startDate: new Date(), status: 'b', returns: 0, source: 'c', createdAt: new Date(), updatedAt: new Date() }];
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      (prisma.primary.$transaction as jest.Mock).mockResolvedValue([result, 1]);

      expect(await service.findAllByClient('123', undefined, paginationDto)).toEqual({ data: result, total: 1, page: 1, limit: 10 });
    });
  });

  describe('findOne', () => {
    it('should return an investment by ID', async () => {
      const result = { id: '1', clientId: '123', amount: 1000, type: 'a', startDate: new Date(), status: 'b', returns: 0, source: 'c', createdAt: new Date(), updatedAt: new Date() };
      (prisma.readReplica.investment.findUnique as jest.Mock).mockResolvedValue(result);

      expect(await service.findOne('1')).toEqual(result);
      expect(prisma.readReplica.investment.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('update', () => {
    it('should update an investment', async () => {
      const dto: UpdateInvestmentDto = { amount: 1500 };
      const result = { id: '1', clientId: '123', amount: 1500, type: 'a', startDate: new Date(), status: 'b', returns: 0, source: 'c', createdAt: new Date(), updatedAt: new Date() };
      (prisma.primary.investment.update as jest.Mock).mockResolvedValue(result);

      expect(await service.update('1', dto)).toEqual(result);
      expect(prisma.primary.investment.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: dto,
      });
    });
  });

  describe('remove', () => {
    it('should delete an investment', async () => {
      const result = { id: '1', clientId: '123', amount: 1500, type: 'a', startDate: new Date(), status: 'b', returns: 0, source: 'c', createdAt: new Date(), updatedAt: new Date() };
      (prisma.primary.investment.delete as jest.Mock).mockResolvedValue(result);

      expect(await service.remove('1')).toEqual(result);
      expect(prisma.primary.investment.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('findByClientAndTypes', () => {
    it('should return investments filtered by client ID and types', async () => {
      const result = [{ id: '1', clientId: '123', type: 'stocks', amount: 1000, startDate: new Date(), status: 'b', returns: 0, source: 'c', createdAt: new Date(), updatedAt: new Date() }];
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      (prisma.primary.$transaction as jest.Mock).mockResolvedValue([result, 1]);

      expect(await service.findByClientAndTypes('123', ['stocks'], paginationDto)).toEqual({ data: result, total: 1, page: 1, limit: 10 });
    });
  });
});
