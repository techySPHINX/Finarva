
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

const mockInventoryService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: typeof mockInventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get(InventoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call create service method', async () => {
      const createItemDto: CreateItemDto = { 
        userId: '1', 
        name: 'test item', 
        quantity: 10, 
        price: 100 
      };
      await controller.create(createItemDto);
      expect(service.create).toHaveBeenCalledWith(createItemDto);
    });
  });

  describe('findAll', () => {
    it('should call findAll service method', async () => {
      const userId = '1';
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

  describe('update', () => {
    it('should call update service method', async () => {
      const id = '1';
      const updateItemDto: UpdateItemDto = { quantity: 20 };
      await controller.update(id, updateItemDto);
      expect(service.update).toHaveBeenCalledWith(id, updateItemDto);
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
