
import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from './loans.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { LoanStatus } from './enums/loan-status.enum';

const loanMock = {
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockPrismaService = {
  primary: { loan: loanMock },
  readReplica: { loan: loanMock },
};

describe('LoansService', () => {
  let service: LoansService;
  let prisma: any;

  beforeEach(async () => {
    // Reset all mocks before each test
    Object.values(loanMock).forEach(fn => fn.mockReset && fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a loan', async () => {
      const createLoanDto: CreateLoanDto = {
        amount: 1000,
        interestRate: 5,
        term: 12,
        type: 'personal',
        clientId: 'client-1',
        status: LoanStatus.PENDING,
      };
      const expectedLoan = { id: '1', ...createLoanDto };
      prisma.primary.loan.create.mockResolvedValue(expectedLoan);

      const result = await service.create(createLoanDto);

      expect(prisma.primary.loan.create).toHaveBeenCalledWith({ data: createLoanDto });
      expect(result).toEqual(expectedLoan);
    });
  });

  describe('findAll', () => {
    it('should return all loans for a user', async () => {
      const userId = '1';
      const loans = [{ id: '1', userId, amount: 1000, interestRate: 5, term: 12, startDate: new Date(), status: LoanStatus.PENDING }];
      prisma.readReplica.loan.findMany.mockResolvedValue(loans);

      const result = await service.findAll(userId);

      expect(prisma.readReplica.loan.findMany).toHaveBeenCalled();
      expect(result).toEqual(loans);
    });
  });

  describe('findOne', () => {
    it('should return a single loan', async () => {
      const id = '1';
      const loan = { id, userId: '1', amount: 1000, interestRate: 5, term: 12, startDate: new Date(), status: LoanStatus.PENDING };
      prisma.readReplica.loan.findUnique.mockResolvedValue(loan);

      const result = await service.findOne(id);

      expect(prisma.readReplica.loan.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(loan);
    });
  });
});
