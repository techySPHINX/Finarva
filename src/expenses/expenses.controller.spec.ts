
import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

const mockExpensesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let service: typeof mockExpensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        {
          provide: ExpensesService,
          useValue: mockExpensesService,
        },
      ],
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
    service = module.get(ExpensesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call create service method', async () => {
      const createExpenseDto: CreateExpenseDto = { 
        userId: '1', 
        category: 'test', 
        amount: 100, 
        date: new Date(),
        description: 'test'
      };
      await controller.create(createExpenseDto);
      expect(service.create).toHaveBeenCalledWith(createExpenseDto);
    });
  });

  describe('findAll', () => {
    it('should call findAll service method', async () => {
      const userId = '1';
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      await controller.findAll(userId, paginationDto);
      expect(service.findAll).toHaveBeenCalledWith(userId, paginationDto);
    });
  });

  describe('findOne', () => {
    it('should call findOne service method', async () => {
      const id = '1';
      await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should call update service method', async () => {
      const id = '1';
      const updateExpenseDto: UpdateExpenseDto = { category: 'updated' };
      await controller.update(id, updateExpenseDto);
      expect(service.update).toHaveBeenCalledWith(id, updateExpenseDto);
    });
  });

  describe('remove', () => {
    it('should call remove service method', async () => {
      const id = '1';
      await controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
