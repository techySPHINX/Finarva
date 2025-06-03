import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentController } from './investment.controller';
import { InvestmentService } from './investment.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { BulkCreateInvestmentDto } from './dto/bulk-create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';

describe('InvestmentController', () => {
  let controller: InvestmentController;
  let service: InvestmentService;

  const mockService = {
    create: jest.fn(),
    bulkCreate: jest.fn(),
    findAllByClient: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByClientAndTypes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestmentController],
      providers: [
        {
          provide: InvestmentService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<InvestmentController>(InvestmentController);
    service = module.get<InvestmentService>(InvestmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to service.create', async () => {
      const dto: CreateInvestmentDto = {
        clientId: 'client-1',
        type: 'FD',
        amount: 1000,
        startDate: '2024-06-01T00:00:00Z',
        status: 'ACTIVE',
        returns: 150,
        source: 'Manual',
      };

      const result = { id: 'inv-1', ...dto };
      mockService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('bulkCreate', () => {
    it('should delegate to service.bulkCreate', async () => {
      const dto: BulkCreateInvestmentDto = {
        investments: [
          {
            clientId: 'client-1',
            type: 'FD',
            amount: 1000,
            startDate: new Date('2024-06-01').toISOString(),
            status: 'ACTIVE',
            returns: 100,
            source: 'Manual',
          },
        ],
      };

      if (!dto.investments) {
        // handle empty or undefined investments case, e.g., return []
        return [];
      }

      const result = dto.investments.map((inv, idx) => ({
        id: `inv-${idx + 1}`,
        ...inv,
      }));

      mockService.bulkCreate.mockResolvedValue(result);

      expect(await controller.bulkCreate(dto)).toEqual(result);
      expect(service.bulkCreate).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAllByClient', () => {
    it('should return investments by clientId', async () => {
      const clientId = 'client-1';
      const result = [{ id: 'inv-1' }];
      mockService.findAllByClient.mockResolvedValue(result);

      expect(await controller.findAllByClient(clientId)).toEqual(result);
      expect(service.findAllByClient).toHaveBeenCalledWith(clientId, undefined);
    });
  });

  describe('findOne', () => {
    it('should return an investment by ID', async () => {
      const result = { id: 'inv-1' };
      mockService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('inv-1')).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith('inv-1');
    });
  });

  describe('update', () => {
    it('should update an investment', async () => {
      const dto: UpdateInvestmentDto = { amount: 5000, status: 'ACTIVE' };
      const result = { id: 'inv-1', ...dto };

      mockService.update.mockResolvedValue(result);

      expect(await controller.update('inv-1', dto)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith('inv-1', dto);
    });
  });

  describe('remove', () => {
    it('should remove an investment', async () => {
      const result = { id: 'inv-1' };
      mockService.remove.mockResolvedValue(result);

      expect(await controller.remove('inv-1')).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith('inv-1');
    });
  });

  describe('findByClientAndTypes', () => {
    it('should return investments by clientId and types', async () => {
      const clientId = 'client-1';
      const typesQueryString = 'FD,SIP';
      const parsedTypes = ['FD', 'SIP'];
      const mockResult = [
        { id: 'inv-1', type: 'FD' },
        { id: 'inv-2', type: 'SIP' },
      ];

      mockService.findByClientAndTypes.mockResolvedValue(mockResult);

      const result = await controller.findByClientAndTypes(
        clientId,
        typesQueryString,
      );
      expect(result).toEqual(mockResult);
      expect(service.findByClientAndTypes).toHaveBeenCalledWith(
        clientId,
        parsedTypes,
      );
    });
  });
});
