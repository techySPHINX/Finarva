import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { AiService } from '../ai/ai.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('ClientsController', () => {
  let controller: ClientsController;
  let clientsService: ClientsService;
  let aiService: any;

  const mockUser = { id: 'agent-1' };
  const mockReq = { user: mockUser };

  const sampleClient = {
    id: 'client-1',
    agentId: 'agent-1',
    name: 'John Doe',
    phone: '9999999999',
    preferredLanguage: 'en',
    goals: ['retirement'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: {
            create: jest.fn(),
            findAllByAgent: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: AiService,
          useValue: {
            analyzeProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
    clientsService = module.get<ClientsService>(ClientsService);
    aiService = module.get<AiService>(AiService);
  });

  describe('create', () => {
    it('should create a client successfully', async () => {
      const dto: CreateClientDto = {
        name: 'John Doe',
        phone: '9999999999',
        language: ''
      };

      (clientsService.create as jest.Mock).mockResolvedValue(sampleClient);
      const result = await controller.create(dto, mockReq as any);
      expect(result).toEqual(sampleClient);
      expect(clientsService.create).toHaveBeenCalledWith(dto, mockUser.id);
    });

    it('should throw BadRequestException on invalid input', async () => {
      (clientsService.create as jest.Mock).mockRejectedValue(
        new BadRequestException('Invalid input'),
      );

      await expect(
        controller.create({} as any, mockReq as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
      (clientsService.create as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        controller.create({} as any, mockReq as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return clients for authenticated agent with default pagination', async () => {
      const mockData = { data: [sampleClient], total: 1, page: 1, limit: 10 };
      (clientsService.findAllByAgent as jest.Mock).mockResolvedValue(mockData);

      const result = await controller.findAll(mockReq as any, {});
      expect(result).toEqual(mockData);
      expect(clientsService.findAllByAgent).toHaveBeenCalledWith(mockUser.id, {});
    });

    it('should return clients for authenticated agent with custom pagination', async () => {
      const customPagination = { page: 2, limit: 5 };
      const mockData = { data: [sampleClient], total: 1, page: 2, limit: 5 };
      (clientsService.findAllByAgent as jest.Mock).mockResolvedValue(mockData);

      const result = await controller.findAll(mockReq as any, customPagination);
      expect(result).toEqual(mockData);
      expect(clientsService.findAllByAgent).toHaveBeenCalledWith(mockUser.id, customPagination);
    });

    it('should throw InternalServerErrorException on failure', async () => {
      (clientsService.findAllByAgent as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(controller.findAll(mockReq as any, {})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return client if owner matches', async () => {
      (clientsService.findOne as jest.Mock).mockResolvedValue(sampleClient);
      const result = await controller.findOne(sampleClient.id, mockReq as any);
      expect(result).toEqual(sampleClient);
    });

    it('should throw ForbiddenException if not owner', async () => {
      (clientsService.findOne as jest.Mock).mockResolvedValue({
        ...sampleClient,
        agentId: 'other-agent',
      });

      await expect(
        controller.findOne(sampleClient.id, mockReq as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(
        controller.findOne(null as any, mockReq as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should propagate NotFoundException', async () => {
      (clientsService.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException('Not found'),
      );

      await expect(
        controller.findOne(sampleClient.id, mockReq as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      (clientsService.findOne as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        controller.findOne(sampleClient.id, mockReq as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateClientDto = { name: 'Updated' };

    it('should update client if owner matches', async () => {
      (clientsService.findOne as jest.Mock).mockResolvedValue(sampleClient);
      (clientsService.update as jest.Mock).mockResolvedValue({
        ...sampleClient,
        ...updateDto,
      });

      const result = await controller.update(
        sampleClient.id,
        updateDto,
        mockReq as any,
      );
      expect(result).toEqual({ ...sampleClient, ...updateDto });
    });

    it('should throw ForbiddenException if not owner', async () => {
      (clientsService.findOne as jest.Mock).mockResolvedValue({
        ...sampleClient,
        agentId: 'other-agent',
      });

      await expect(
        controller.update(sampleClient.id, updateDto, mockReq as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(
        controller.update(null as any, updateDto, mockReq as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should propagate NotFoundException', async () => {
      (clientsService.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException('Not found'),
      );

      await expect(
        controller.update(sampleClient.id, updateDto, mockReq as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      (clientsService.findOne as jest.Mock).mockResolvedValue(sampleClient);
      (clientsService.update as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        controller.update(sampleClient.id, updateDto, mockReq as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should delete client if owner matches', async () => {
      (clientsService.findOne as jest.Mock).mockResolvedValue(sampleClient);
      (clientsService.remove as jest.Mock).mockResolvedValue({
        id: sampleClient.id,
      });

      const result = await controller.remove(sampleClient.id, mockReq as any);
      expect(result).toEqual({ id: sampleClient.id });
    });

    it('should throw ForbiddenException if not owner', async () => {
      (clientsService.findOne as jest.Mock).mockResolvedValue({
        ...sampleClient,
        agentId: 'other-agent',
      });

      await expect(
        controller.remove(sampleClient.id, mockReq as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(
        controller.remove(null as any, mockReq as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should propagate NotFoundException', async () => {
      (clientsService.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException('Not found'),
      );

      await expect(
        controller.remove(sampleClient.id, mockReq as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      (clientsService.findOne as jest.Mock).mockResolvedValue(sampleClient);
      (clientsService.remove as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        controller.remove(sampleClient.id, mockReq as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getClientAiInsights', () => {
    it('should return AI insights if owner matches', async () => {
      const mockInsights = { summary: 'Good client' };
      (clientsService.findOne as jest.Mock).mockResolvedValue(sampleClient);
      (aiService.analyzeProfile as jest.Mock).mockResolvedValue(mockInsights);

      const result = await controller.getClientAiInsights(
        sampleClient.id,
        mockReq as any,
      );
      expect(result).toEqual(mockInsights);
    });

    it('should throw ForbiddenException if not owner', async () => {
      (clientsService.findOne as jest.Mock).mockResolvedValue({
        ...sampleClient,
        agentId: 'other-agent',
      });

      await expect(
        controller.getClientAiInsights(sampleClient.id, mockReq as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(
        controller.getClientAiInsights(null as any, mockReq as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should propagate NotFoundException', async () => {
      (clientsService.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException('Not found'),
      );

      await expect(
        controller.getClientAiInsights(sampleClient.id, mockReq as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      (clientsService.findOne as jest.Mock).mockResolvedValue(sampleClient);
      (aiService.analyzeProfile as jest.Mock).mockRejectedValue(
        new Error('AI error'),
      );

      await expect(
        controller.getClientAiInsights(sampleClient.id, mockReq as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
