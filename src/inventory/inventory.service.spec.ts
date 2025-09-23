
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

const mockPrismaService = {
  primary: {
    inventoryItem: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
  readReplica: {
    inventoryItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
};

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an inventory item', async () => {
      const createItemDto: CreateItemDto = { 
        userId: '1', 
        name: 'test item', 
        quantity: 10, 
        price: 100 
      };
      const expectedItem = { id: '1', ...createItemDto };
      prisma.primary.inventoryItem.create.mockResolvedValue(expectedItem);

      const result = await service.create(createItemDto);

      expect(prisma.primary.inventoryItem.create).toHaveBeenCalledWith({ data: createItemDto });
      expect(result).toEqual(expectedItem);
    });
  });

  describe('findAll', () => {
    it('should return all inventory items for a user', async () => {
      const userId = '1';
      const items = [{ id: '1', userId, name: 'test item', quantity: 10, price: 100 }];
      prisma.readReplica.inventoryItem.findMany.mockResolvedValue(items);

      const result = await service.findAll(userId);

      expect(prisma.readReplica.inventoryItem.findMany).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toEqual(items);
    });
  });

  describe('findOne', () => {
    it('should return a single inventory item', async () => {
      const id = '1';
      const item = { id, userId: '1', name: 'test item', quantity: 10, price: 100 };
      prisma.readReplica.inventoryItem.findUnique.mockResolvedValue(item);

      const result = await service.findOne(id);

      expect(prisma.readReplica.inventoryItem.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(item);
    });
  });

  describe('update', () => {
    it('should update an inventory item', async () => {
      const id = '1';
      const updateItemDto: UpdateItemDto = { quantity: 20 };
      const updatedItem = { id, userId: '1', name: 'test item', quantity: 20, price: 100 };
      prisma.primary.inventoryItem.update.mockResolvedValue(updatedItem);

      const result = await service.update(id, updateItemDto);

      expect(prisma.primary.inventoryItem.update).toHaveBeenCalledWith({
        where: { id },
        data: updateItemDto,
      });
      expect(result).toEqual(updatedItem);
    });
  });

  describe('remove', () => {
    it('should delete an inventory item', async () => {
      const id = '1';
      const deletedItem = { id, userId: '1', name: 'test item', quantity: 10, price: 100 };
      prisma.primary.inventoryItem.delete.mockResolvedValue(deletedItem);

      const result = await service.remove(id);

      expect(prisma.primary.inventoryItem.delete).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(deletedItem);
    });
  });
});
