import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentService } from './investment.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { BulkCreateInvestmentDto } from './dto/bulk-create-investment.dto';

describe('InvestmentService', () => {
  let service: InvestmentService;
  let prisma: PrismaService;

  const mockPrisma = {
    investment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestmentService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<InvestmentService>(InvestmentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an investment', async () => {
      const dto: CreateInvestmentDto = {
        clientId: 'client-1',
        type: 'Small Cap',
        amount: 5000,
        startDate: '2024-06-01T00:00:00Z',
        status: 'active',
        returns: 650.75,
        source: 'PartnerAPI',
      };

      const createdInvestment = { id: 'inv-1', ...dto };
      mockPrisma.investment.create.mockResolvedValue(createdInvestment);

      const result = await service.create(dto);
      expect(prisma.investment.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(createdInvestment);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple investments', async () => {
      const dto: BulkCreateInvestmentDto = {
        investments: [
          {
            clientId: 'client-1',
            amount: 500,
            type: 'FD',
            status: 'PENDING',
            startDate: '2023-01-01T00:00:00Z',
            returns: 50,
            source: 'Manual',
          },
          {
            clientId: 'client-1',
            amount: 800,
            type: 'SIP',
            status: 'ACTIVE',
            startDate: '2023-02-01T00:00:00Z',
            source: 'PartnerAPI',
          },
        ],
      };

      if (!dto.investments) {
        // handle empty or undefined investments case, e.g., return []
        return [];
      }

      const created = dto.investments.map((inv, idx) => ({
        id: `inv-${idx + 1}`,
        ...inv,
      }));
      mockPrisma.investment.create
        .mockResolvedValueOnce(created[0])
        .mockResolvedValueOnce(created[1]);

      const result = await service.bulkCreate(dto);
      expect(result).toEqual(created);
      expect(prisma.investment.create).toHaveBeenCalledTimes(2);
    });

    it('should return empty array if investments list is empty', async () => {
      const dto: BulkCreateInvestmentDto = { investments: [] };
      const result = await service.bulkCreate(dto);
      expect(result).toEqual([]);
      expect(prisma.investment.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllByClient', () => {
    it('should find investments by clientId', async () => {
      const clientId = 'client-1';
      const mockResult = [{ id: 'inv-1' }, { id: 'inv-2' }];
      mockPrisma.investment.findMany.mockResolvedValue(mockResult);

      const result = await service.findAllByClient(clientId);
      expect(prisma.investment.findMany).toHaveBeenCalledWith({
        where: { clientId, status: undefined },
      });
      expect(result).toEqual(mockResult);
    });

    it('should filter by status if provided', async () => {
      const result = [{ id: 'inv-1' }];
      mockPrisma.investment.findMany.mockResolvedValue(result);

      await service.findAllByClient('client-1', 'ACTIVE');
      expect(prisma.investment.findMany).toHaveBeenCalledWith({
        where: { clientId: 'client-1', status: 'ACTIVE' },
      });
    });
  });

  describe('findOne', () => {
    it('should return an investment by ID', async () => {
      const investment = {
        id: 'inv-1',
        clientId: 'client-1',
        type: 'FD',
        amount: 500,
        startDate: '2024-01-01T00:00:00Z',
        status: 'active',
      };
      mockPrisma.investment.findUnique.mockResolvedValue(investment);

      const result = await service.findOne('inv-1');
      expect(prisma.investment.findUnique).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
      });
      expect(result).toEqual(investment);
    });
  });

  describe('update', () => {
    it('should update an investment by ID', async () => {
      const dto: UpdateInvestmentDto = {
        amount: 1500,
        status: 'ACTIVE',
        returns: 300.25,
      };

      const updated = { id: 'inv-1', ...dto };
      mockPrisma.investment.update.mockResolvedValue(updated);

      const result = await service.update('inv-1', dto);
      expect(prisma.investment.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: dto,
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete an investment by ID', async () => {
      const deleted = {
        id: 'inv-1',
        clientId: 'client-1',
        type: 'SIP',
        amount: 800,
        startDate: '2023-02-01T00:00:00Z',
        status: 'withdrawn',
      };
      mockPrisma.investment.delete.mockResolvedValue(deleted);

      const result = await service.remove('inv-1');
      expect(prisma.investment.delete).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
      });
      expect(result).toEqual(deleted);
    });
  });

  describe('findByClientAndTypes', () => {
    it('should return investments filtered by type and clientId', async () => {
      const result = [
        { id: 'inv-1', type: 'FD' },
        { id: 'inv-2', type: 'SIP' },
      ];
      mockPrisma.investment.findMany.mockResolvedValue(result);

      const types = ['FD', 'SIP'];
      const clientId = 'client-1';
      const response = await service.findByClientAndTypes(clientId, types);

      expect(prisma.investment.findMany).toHaveBeenCalledWith({
        where: {
          clientId,
          type: { in: types },
        },
      });
      expect(response).toEqual(result);
    });
  });
});
