import { Test, TestingModule } from '@nestjs/testing';
import { InsuranceController } from './insurance.controller';
import { InsuranceService } from './insurance.service';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';
import { AiInsuranceInputDto } from './dto/ai-insurance-input.dto';

describe('InsuranceController', () => {
  let controller: InsuranceController;
  let service: InsuranceService;

  const mockInsuranceService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllByClient: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    suggestInsurance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsuranceController],
      providers: [
        { provide: InsuranceService, useValue: mockInsuranceService },
      ],
    }).compile();

    controller = module.get<InsuranceController>(InsuranceController);
    service = module.get<InsuranceService>(InsuranceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create insurance', async () => {
      const dto: CreateInsuranceDto = {
        clientId: '123',
        type: 'health',
        premium: 1000,
      } as any;
      const result = { id: '1', ...dto };
      mockInsuranceService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(mockInsuranceService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException from service', async () => {
      mockInsuranceService.create.mockRejectedValue(
        new ConflictException('Conflict'),
      );
      await expect(controller.create({} as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException on unknown error', async () => {
      mockInsuranceService.create.mockRejectedValue(new Error('Unknown'));
      await expect(controller.create({} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all insurance entries', async () => {
      const result = [{ id: '1', clientId: '123' }];
      mockInsuranceService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(mockInsuranceService.findAll).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on failure', async () => {
      mockInsuranceService.findAll.mockRejectedValue(new Error('DB error'));
      await expect(controller.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findByClient', () => {
    it('should return insurance entries for a client', async () => {
      const result = [{ id: '1', clientId: '123' }];
      mockInsuranceService.findAllByClient.mockResolvedValue(result);

      expect(await controller.findByClient('123')).toEqual(result);
      expect(mockInsuranceService.findAllByClient).toHaveBeenCalledWith('123');
    });

    it('should throw BadRequestException for invalid clientId', async () => {
      await expect(controller.findByClient(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException from service', async () => {
      mockInsuranceService.findAllByClient.mockRejectedValue(
        new NotFoundException('Not found'),
      );
      await expect(controller.findByClient('123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on failure', async () => {
      mockInsuranceService.findAllByClient.mockRejectedValue(
        new Error('DB error'),
      );
      await expect(controller.findByClient('123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return an insurance entry by ID', async () => {
      const result = { id: '1', clientId: '123' };
      mockInsuranceService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toEqual(result);
      expect(mockInsuranceService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(controller.findOne(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException from service', async () => {
      mockInsuranceService.findOne.mockRejectedValue(
        new NotFoundException('Not found'),
      );
      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on failure', async () => {
      mockInsuranceService.findOne.mockRejectedValue(new Error('DB error'));
      await expect(controller.findOne('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update insurance entry', async () => {
      const dto: UpdateInsuranceDto = { premium: 1500 } as any;
      const result = { id: '1', ...dto };
      mockInsuranceService.update.mockResolvedValue(result);

      expect(await controller.update('1', dto)).toEqual(result);
      expect(mockInsuranceService.update).toHaveBeenCalledWith('1', dto);
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(controller.update(null as any, {} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException from service', async () => {
      mockInsuranceService.update.mockRejectedValue(
        new NotFoundException('Not found'),
      );
      await expect(controller.update('1', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException from service', async () => {
      mockInsuranceService.update.mockRejectedValue(
        new ConflictException('Conflict'),
      );
      await expect(controller.update('1', {} as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException on failure', async () => {
      mockInsuranceService.update.mockRejectedValue(new Error('DB error'));
      await expect(controller.update('1', {} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('suggestInsurance', () => {
    it('should return AI suggestions', async () => {
      const dto: AiInsuranceInputDto = { age: 30, income: 50000 } as any;
      const result = { suggestions: ['policy1', 'policy2'] };
      mockInsuranceService.suggestInsurance.mockResolvedValue(result);

      expect(await controller.suggestInsurance(dto)).toEqual(result);
      expect(mockInsuranceService.suggestInsurance).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException from service', async () => {
      mockInsuranceService.suggestInsurance.mockRejectedValue(
        new BadRequestException('Invalid input'),
      );
      await expect(controller.suggestInsurance({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on failure', async () => {
      mockInsuranceService.suggestInsurance.mockRejectedValue(
        new Error('AI error'),
      );
      await expect(controller.suggestInsurance({} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
