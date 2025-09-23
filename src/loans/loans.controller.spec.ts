
import { Test, TestingModule } from '@nestjs/testing';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { LoanStatus } from './enums/loan-status.enum';

const mockLoansService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
};

describe('LoansController', () => {
  let controller: LoansController;
  let service: typeof mockLoansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoansController],
      providers: [
        {
          provide: LoansService,
          useValue: mockLoansService,
        },
      ],
    }).compile();

    controller = module.get<LoansController>(LoansController);
    service = module.get(LoansService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call create service method', async () => {
      const createLoanDto: CreateLoanDto = {
        amount: 1000,
        interestRate: 5,
        term: 12,
        type: 'personal',
        clientId: 'client-1',
        status: LoanStatus.PENDING,
      };
      await controller.create(createLoanDto);
      expect(service.create).toHaveBeenCalledWith(createLoanDto);
    });
  });

  describe('findAll', () => {
    it('should call findAll service method', async () => {
      const userId = 'user-1';
      await controller.findAll(userId);
      expect(service.findAll).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOne', () => {
    it('should call findOne service method', async () => {
      const id = '1';
      await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });
});
