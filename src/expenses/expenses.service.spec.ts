
import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

const mockPrismaService = {
  primary: {
    expense: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  readReplica: {
    expense: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
  },
};

describe('ExpensesService', () => {
  let service: ExpensesService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    prisma = module.get(PrismaService);
    prisma.primary.$transaction.mockImplementation(async (promises) => Promise.all(promises));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an expense', async () => {
      const createExpenseDto: CreateExpenseDto = {
        userId: '1',
        category: 'test',
        amount: 100,
        date: new Date(),
        description: 'test description'
      };
      const expectedExpense = { id: '1', ...createExpenseDto };
      prisma.primary.expense.create.mockResolvedValue(expectedExpense);

      const result = await service.create(createExpenseDto);

      expect(prisma.primary.expense.create).toHaveBeenCalledWith({ data: createExpenseDto });
      expect(result).toEqual(expectedExpense);
    });
  });

  describe('findAll', () => {
    it('should return paginated expenses for a user', async () => {
      const userId = '1';
      const paginationDto = { page: 1, limit: 10 };
      const expenses = [{ id: '1', userId, category: 'test', amount: 100, date: new Date(), description: '' }];
      const total = 1;

      prisma.readReplica.expense.findMany.mockResolvedValue(expenses);
      prisma.readReplica.expense.count.mockResolvedValue(total);

      const result = await service.findAll(userId, paginationDto);

      expect(prisma.readReplica.expense.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: 0,
        take: 10,
      });
      expect(prisma.readReplica.expense.count).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toEqual({
        data: expenses,
        total,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single expense', async () => {
      const id = '1';
      const expense = { id, userId: '1', category: 'test', amount: 100, date: new Date(), description: '' };
      prisma.readReplica.expense.findUnique.mockResolvedValue(expense);

      const result = await service.findOne(id);

      expect(prisma.readReplica.expense.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(expense);
    });
  });

  describe('update', () => {
    it('should update an expense', async () => {
      const id = '1';
      const updateExpenseDto: UpdateExpenseDto = { category: 'updated' };
      const updatedExpense = { id, userId: '1', category: 'updated', amount: 100, date: new Date(), description: '' };
      prisma.primary.expense.update.mockResolvedValue(updatedExpense);

      const result = await service.update(id, updateExpenseDto);

      expect(prisma.primary.expense.update).toHaveBeenCalledWith({
        where: { id },
        data: updateExpenseDto,
      });
      expect(result).toEqual(updatedExpense);
    });
  });

  describe('remove', () => {
    it('should delete an expense', async () => {
      const id = '1';
      const deletedExpense = { id, userId: '1', category: 'test', amount: 100, date: new Date(), description: '' };
      prisma.primary.expense.delete.mockResolvedValue(deletedExpense);

      const result = await service.remove(id);

      expect(prisma.primary.expense.delete).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(deletedExpense);
    });
  });
});
