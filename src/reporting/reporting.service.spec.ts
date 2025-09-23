
import { Test, TestingModule } from '@nestjs/testing';
import { ReportingService } from './reporting.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  primary: {
    expense: {
      findMany: jest.fn(),
    },
    investment: {
      findMany: jest.fn(),
    },
    loan: {
      findMany: jest.fn(),
    },
    inventoryItem: {
      findMany: jest.fn(),
    },
  },
};

describe('ReportingService', () => {
  let service: ReportingService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportingService>(ReportingService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateReport', () => {
    it('should generate a report with correct totals', async () => {
      const userId = 'test-user-id';

      prisma.primary.expense.findMany.mockResolvedValue([
        { amount: 100 },
        { amount: 200 },
      ]);
      prisma.primary.investment.findMany.mockResolvedValue([
        { amount: 500 },
        { amount: 1000 },
      ]);
      prisma.primary.loan.findMany.mockResolvedValue([
        { amount: 1000 },
        { amount: 2000 },
      ]);
      prisma.primary.inventoryItem.findMany.mockResolvedValue([
        { price: 10, quantity: 5 },
        { price: 20, quantity: 10 },
      ]);

      const report = await service.generateReport(userId);

      expect(prisma.primary.expense.findMany).toHaveBeenCalledWith({ where: { userId } });
      expect(prisma.primary.investment.findMany).toHaveBeenCalledWith({ where: { clientId: userId } });
      expect(prisma.primary.loan.findMany).toHaveBeenCalledWith({ where: { clientId: userId } });
      expect(prisma.primary.inventoryItem.findMany).toHaveBeenCalledWith({ where: { userId } });

      expect(report).toEqual({
        totalExpenses: 300,
        totalInvestments: 1500,
        totalLoans: 3000,
        totalInventoryValue: 250,
      });
    });

    it('should handle empty data for all categories', async () => {
      const userId = 'test-user-id';

      prisma.primary.expense.findMany.mockResolvedValue([]);
      prisma.primary.investment.findMany.mockResolvedValue([]);
      prisma.primary.loan.findMany.mockResolvedValue([]);
      prisma.primary.inventoryItem.findMany.mockResolvedValue([]);

      const report = await service.generateReport(userId);

      expect(report).toEqual({
        totalExpenses: 0,
        totalInvestments: 0,
        totalLoans: 0,
        totalInventoryValue: 0,
      });
    });

    it('should handle partial empty data', async () => {
      const userId = 'test-user-id';

      prisma.primary.expense.findMany.mockResolvedValue([{ amount: 100 }]);
      prisma.primary.investment.findMany.mockResolvedValue([]);
      prisma.primary.loan.findMany.mockResolvedValue([{ amount: 500 }]);
      prisma.primary.inventoryItem.findMany.mockResolvedValue([]);

      const report = await service.generateReport(userId);

      expect(report).toEqual({
        totalExpenses: 100,
        totalInvestments: 0,
        totalLoans: 500,
        totalInventoryValue: 0,
      });
    });
  });
});
