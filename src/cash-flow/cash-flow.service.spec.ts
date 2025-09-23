
import { Test, TestingModule } from '@nestjs/testing';
import { CashFlowService } from './cash-flow.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  readReplica: {
    expense: {
      aggregate: jest.fn(),
    },
    investment: {
      aggregate: jest.fn(),
    },
  },
};

describe('CashFlowService', () => {
  let service: CashFlowService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CashFlowService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CashFlowService>(CashFlowService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyze', () => {
    it('should calculate net cash flow correctly', async () => {
      prisma.readReplica.expense.aggregate.mockResolvedValue({ _sum: { amount: 1000 } });
      prisma.readReplica.investment.aggregate.mockResolvedValue({ _sum: { returns: 5000 } });

      const result = await service.analyze('test-user-id');
      expect(result).toEqual({
        totalIncome: 5000,
        totalExpenses: 1000,
        netCashFlow: 4000,
      });
    });

    it('should handle zero expenses', async () => {
      prisma.readReplica.expense.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
      prisma.readReplica.investment.aggregate.mockResolvedValue({ _sum: { returns: 5000 } });

      const result = await service.analyze('test-user-id');
      expect(result).toEqual({
        totalIncome: 5000,
        totalExpenses: 0,
        netCashFlow: 5000,
      });
    });

    it('should handle zero income', async () => {
      prisma.readReplica.expense.aggregate.mockResolvedValue({ _sum: { amount: 1000 } });
      prisma.readReplica.investment.aggregate.mockResolvedValue({ _sum: { returns: 0 } });

      const result = await service.analyze('test-user-id');
      expect(result).toEqual({
        totalIncome: 0,
        totalExpenses: 1000,
        netCashFlow: -1000,
      });
    });
  });

  describe('forecast', () => {
    it('should return a 12-month forecast', async () => {
      // Mock the analyze method as forecast depends on it
      jest.spyOn(service, 'analyze').mockResolvedValue({
        totalIncome: 6000,
        totalExpenses: 3600,
        netCashFlow: 2400,
      });

      const forecast = await service.forecast('test-user-id');
      expect(forecast).toHaveLength(12);
      expect(forecast[0].month).toBe(1);
      expect(forecast[0].projectedNetCashFlow).toBe(200); // 2400 / 12
      expect(forecast[11].month).toBe(12);
      expect(forecast[11].projectedNetCashFlow).toBe(2400);
    });
  });
});
