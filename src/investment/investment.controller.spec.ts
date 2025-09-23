import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentController } from './investment.controller';
import { InvestmentService } from './investment.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { BulkCreateInvestmentDto } from './dto/bulk-create-investment.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';

describe('InvestmentController', () => {
  let controller: InvestmentController;
  let service: InvestmentService;

  const mockInvestmentService = {
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
          useValue: mockInvestmentService,
        },
      ],
    }).compile();

    controller = module.get<InvestmentController>(InvestmentController);
    service = module.get<InvestmentService>(InvestmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      const result = { id: '1', ...dto };
      mockInvestmentService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(dto);
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
      const result = { count: 1 };
      mockInvestmentService.bulkCreate.mockResolvedValue(result);

      expect(await controller.bulkCreate(dto)).toEqual(result);
      expect(service.bulkCreate).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAllByClient', () => {
    it('should return investments for a client', async () => {
      const result = { data: [], total: 0, page: 1, limit: 10 };
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      mockInvestmentService.findAllByClient.mockResolvedValue(result);

      expect(
        await controller.findAllByClient('123', undefined, paginationDto),
      ).toEqual(result);
      expect(service.findAllByClient).toHaveBeenCalledWith(
        '123',
        undefined,
        paginationDto,
      );
    });
  });

  describe('findOne', () => {
    it('should return an investment by ID', async () => {
      const result = { id: '1', clientId: '123', amount: 1000 };
      mockInvestmentService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update an investment', async () => {
      const dto: UpdateInvestmentDto = { amount: 1500 };
      const result = { id: '1', ...dto };
      mockInvestmentService.update.mockResolvedValue(result);

      expect(await controller.update('1', dto)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('should delete an investment', async () => {
      const result = { id: '1', deleted: true };
      mockInvestmentService.remove.mockResolvedValue(result);

      expect(await controller.remove('1')).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('findByClientAndTypes', () => {
    it('should return investments filtered by client ID and types', async () => {
      const result = { data: [], total: 0, page: 1, limit: 10 };
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      mockInvestmentService.findByClientAndTypes.mockResolvedValue(result);

      expect(
        await controller.findByClientAndTypes('123', 'stocks', paginationDto),
      ).toEqual(result);
      expect(service.findByClientAndTypes).toHaveBeenCalledWith(
        '123',
        ['stocks'],
        paginationDto,
      );
    });
  });
});