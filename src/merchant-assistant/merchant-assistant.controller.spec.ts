
import { Test, TestingModule } from '@nestjs/testing';
import { MerchantAssistantController } from './merchant-assistant.controller';
import { MerchantAssistantService } from './merchant-assistant.service';
import { CreateMerchantAssistantDto } from './dto/create-merchant-assistant.dto';
import { UpdateMerchantAssistantDto } from './dto/update-merchant-assistant.dto';

const mockMerchantAssistantService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('MerchantAssistantController', () => {
  let controller: MerchantAssistantController;
  let service: typeof mockMerchantAssistantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MerchantAssistantController],
      providers: [
        {
          provide: MerchantAssistantService,
          useValue: mockMerchantAssistantService,
        },
      ],
    }).compile();

    controller = module.get<MerchantAssistantController>(MerchantAssistantController);
    service = module.get(MerchantAssistantService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call create service method', async () => {
      const createDto: CreateMerchantAssistantDto = {
        merchantId: 'merchant123',
        query: 'test query',
      };
      await controller.create(createDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should call findAll service method', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call findOne service method', async () => {
      const id = '1';
      await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(+id);
    });
  });

  describe('update', () => {
    it('should call update service method', async () => {
      const id = '1';
      const updateDto: UpdateMerchantAssistantDto = { query: 'updated query' };
      await controller.update(id, updateDto);
      expect(service.update).toHaveBeenCalledWith(+id, updateDto);
    });
  });

  describe('remove', () => {
    it('should call remove service method', async () => {
      const id = '1';
      await controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(+id);
    });
  });
});
