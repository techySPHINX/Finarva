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
        startDate: '',
        status: ''
      };
      const result = { id: '1', ...dto };
      mockInvestmentService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should throw internal server error on failure', async () => {
      mockInvestmentService.create.mockRejectedValue(new Error('DB error'));
      await expect(controller.create({} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('bulkCreate', () => {
    it('should create investments in bulk', async () => {
      const dto: BulkCreateInvestmentDto = {
        investments: [{
          amount: 1000, clientId: '123', type: 'stocks',
          startDate: '',
          status: ''
        }],
      };
      const result = [{ id: '1', ...(dto.investments?.[0] ?? {}) }];
      mockInvestmentService.bulkCreate.mockResolvedValue(result);

      expect(await controller.bulkCreate(dto)).toEqual(result);
      expect(service.bulkCreate).toHaveBeenCalledWith(dto);
    });

    it('should throw bad request if investments data is invalid', async () => {
      mockInvestmentService.bulkCreate.mockRejectedValue(
        new BadRequestException('Invalid investments data'),
      );

      await expect(controller.bulkCreate({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw internal server error on failure', async () => {
      const dto: BulkCreateInvestmentDto = {
        investments: [{
          amount: 1000, clientId: '123', type: 'stocks',
          startDate: '',
          status: ''
        }],
      };
      mockInvestmentService.bulkCreate.mockRejectedValue(new Error('DB error'));

      await expect(controller.bulkCreate(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAllByClient', () => {
    it('should return investments for a client', async () => {
      const result = [{ id: '1', clientId: '123', amount: 1000 }];
      mockInvestmentService.findAllByClient.mockResolvedValue(result);

      expect(await controller.findAllByClient('123', undefined)).toEqual(
        result,
      );
      expect(service.findAllByClient).toHaveBeenCalledWith('123', undefined);
    });

    it('should throw bad request for invalid client ID', async () => {
      await expect(
        controller.findAllByClient(null as any, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw internal server error on failure', async () => {
      mockInvestmentService.findAllByClient.mockRejectedValue(
        new Error('DB error'),
      );
      await expect(
        controller.findAllByClient('123', undefined),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return an investment by ID', async () => {
      const result = { id: '1', clientId: '123', amount: 1000 };
      mockInvestmentService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw bad request for invalid ID', async () => {
      await expect(controller.findOne(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw not found if investment not exists', async () => {
      mockInvestmentService.findOne.mockRejectedValue(
        new NotFoundException('Not found'),
      );
      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw internal server error on failure', async () => {
      mockInvestmentService.findOne.mockRejectedValue(new Error('DB error'));
      await expect(controller.findOne('1')).rejects.toThrow(
        InternalServerErrorException,
      );
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

    it('should throw bad request for invalid ID', async () => {
      await expect(controller.update(null as any, {} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw internal server error on failure', async () => {
      mockInvestmentService.update.mockRejectedValue(new Error('DB error'));
      await expect(controller.update('1', {} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should delete an investment', async () => {
      const result = { id: '1', deleted: true };
      mockInvestmentService.remove.mockResolvedValue(result);

      expect(await controller.remove('1')).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should throw bad request for invalid ID', async () => {
      await expect(controller.remove(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw internal server error on failure', async () => {
      mockInvestmentService.remove.mockRejectedValue(new Error('DB error'));
      await expect(controller.remove('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findByClientAndTypes', () => {
    it('should return investments filtered by client ID and types', async () => {
      const result = [{ id: '1', clientId: '123', type: 'stocks' }];
      mockInvestmentService.findByClientAndTypes.mockResolvedValue(result);

      expect(await controller.findByClientAndTypes('123', 'stocks')).toEqual(
        result,
      );
      expect(service.findByClientAndTypes).toHaveBeenCalledWith('123', [
        'stocks',
      ]);
    });

    it('should throw bad request for invalid client ID', async () => {
      await expect(
        controller.findByClientAndTypes(null as any, 'stocks'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw bad request for invalid types param', async () => {
      await expect(
        controller.findByClientAndTypes('123', null as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw bad request if types param is empty', async () => {
      await expect(controller.findByClientAndTypes('123', ',')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw internal server error on failure', async () => {
      mockInvestmentService.findByClientAndTypes.mockRejectedValue(
        new Error('DB error'),
      );
      await expect(
        controller.findByClientAndTypes('123', 'stocks'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
