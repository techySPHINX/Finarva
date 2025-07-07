import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ClientsService } from './clients.service';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Client, Prisma } from '@prisma/client';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

describe('ClientsService', () => {
  let service: ClientsService;
  let prisma: PrismaService;

  const sampleAgentId = 'agent-1';
  const sampleClient: Client = {
    id: 'client-1',
    name: 'John Doe',
    phone: '9999999999',
    preferredLanguage: 'en',
    age: 30,
    gender: 'Male',
    income: 50000,
    goals: ['Retirement', 'Education'],
    agentId: sampleAgentId,
    createdAt: new Date(),
    language: '',
    occupation: null,
    interests: [],
    investmentExperience: null
  };

  const sampleCreateDto: CreateClientDto = {
    name: sampleClient.name,
    phone: sampleClient.phone,
    language: sampleClient.preferredLanguage ?? 'en',
    age: sampleClient.age === null ? undefined : sampleClient.age,
    gender: sampleClient.gender === null ? undefined : sampleClient.gender,
    income: sampleClient.income === null ? undefined : sampleClient.income,
    goals: sampleClient.goals,
  };

  const sampleUpdateDto: UpdateClientDto = {
    name: 'Updated Name',
    phone: '8888888888',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: PrismaService,
          useValue: {
            client: {
              create: jest.fn().mockResolvedValue(sampleClient),
              findMany: jest.fn().mockResolvedValue([sampleClient]),
              findUnique: jest.fn().mockResolvedValue(sampleClient),
              update: jest
                .fn()
                .mockResolvedValue({ ...sampleClient, ...sampleUpdateDto }),
              delete: jest.fn().mockResolvedValue(sampleClient),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a client successfully', async () => {
      const result = await service.create(sampleCreateDto, sampleAgentId);
      expect(result).toEqual(sampleClient);
      expect(prisma.client.create).toHaveBeenCalledWith({
        data: {
          ...sampleCreateDto,
          agentId: sampleAgentId,
          preferredLanguage: sampleCreateDto.language,
        },
      });
    });

    it('should throw BadRequestException when name or phone is missing', async () => {
      await expect(
        service.create({} as CreateClientDto, sampleAgentId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on phone conflict', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Conflict', {
        code: 'P2002',
        clientVersion: '1.0',
        meta: { target: ['phone'] },
      });
      jest.spyOn(prisma.client, 'create').mockRejectedValueOnce(error);

      await expect(
        service.create(sampleCreateDto, sampleAgentId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on unknown error', async () => {
      jest
        .spyOn(prisma.client, 'create')
        .mockRejectedValueOnce(new Error('DB error'));

      await expect(
        service.create(sampleCreateDto, sampleAgentId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAllByAgent', () => {
    it('should return clients for an agent', async () => {
      const result = await service.findAllByAgent(sampleAgentId);
      expect(result).toEqual([sampleClient]);
      expect(prisma.client.findMany).toHaveBeenCalledWith({
        where: { agentId: sampleAgentId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should throw InternalServerErrorException on error', async () => {
      jest
        .spyOn(prisma.client, 'findMany')
        .mockRejectedValueOnce(new Error('DB error'));
      await expect(service.findAllByAgent(sampleAgentId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      const result = await service.findOne(sampleClient.id);
      expect(result).toEqual(sampleClient);
      expect(prisma.client.findUnique).toHaveBeenCalledWith({
        where: { id: sampleClient.id },
      });
    });

    it('should throw BadRequestException for invalid id format', async () => {
      await expect(service.findOne(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when client not found', async () => {
      jest.spyOn(prisma.client, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on error', async () => {
      jest
        .spyOn(prisma.client, 'findUnique')
        .mockRejectedValueOnce(new Error('DB error'));
      await expect(service.findOne(sampleClient.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update a client successfully', async () => {
      const result = await service.update(sampleClient.id, sampleUpdateDto);
      expect(result).toEqual({ ...sampleClient, ...sampleUpdateDto });
      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id: sampleClient.id },
        data: {
          ...sampleUpdateDto,
          preferredLanguage: sampleUpdateDto.language,
        },
      });
    });

    it('should throw BadRequestException for invalid id format', async () => {
      await expect(
        service.update(null as any, sampleUpdateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if client not found', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '1.0',
      });
      jest.spyOn(prisma.client, 'update').mockRejectedValueOnce(error);

      await expect(
        service.update('non-existent-id', sampleUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on phone conflict', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Conflict', {
        code: 'P2002',
        clientVersion: '1.0',
        meta: { target: ['phone'] },
      });
      jest.spyOn(prisma.client, 'update').mockRejectedValueOnce(error);

      await expect(
        service.update(sampleClient.id, sampleUpdateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on unknown error', async () => {
      jest
        .spyOn(prisma.client, 'update')
        .mockRejectedValueOnce(new Error('DB error'));
      await expect(
        service.update(sampleClient.id, sampleUpdateDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should remove a client successfully', async () => {
      const result = await service.remove(sampleClient.id);
      expect(result).toEqual(sampleClient);
      expect(prisma.client.delete).toHaveBeenCalledWith({
        where: { id: sampleClient.id },
      });
    });

    it('should throw BadRequestException for invalid id format', async () => {
      await expect(service.remove(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if client not found', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '1.0',
      });
      jest.spyOn(prisma.client, 'delete').mockRejectedValueOnce(error);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on unknown error', async () => {
      jest
        .spyOn(prisma.client, 'delete')
        .mockRejectedValueOnce(new Error('DB error'));
      await expect(service.remove(sampleClient.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getClientProfile', () => {
    it('should return client profile', async () => {
      const result = await service.getClientProfile(sampleClient.id);
      expect(result).toEqual({
        id: sampleClient.id,
        name: sampleClient.name,
        phone: sampleClient.phone,
        language: sampleClient.preferredLanguage,
        age: sampleClient.age,
        gender: sampleClient.gender,
        income: sampleClient.income,
        goals: sampleClient.goals,
        agentId: sampleClient.agentId,
      });
    });

    it('should handle missing optional fields', async () => {
      const clientWithoutOptional: Client = {
        ...sampleClient,
        age: null,
        gender: null,
        income: null,
        goals: [],
        preferredLanguage: null,
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(clientWithoutOptional);

      const result = await service.getClientProfile(sampleClient.id);
      expect(result).toEqual({
        id: sampleClient.id,
        name: sampleClient.name,
        phone: sampleClient.phone,
        language: 'en', // Default from service
        age: undefined,
        gender: undefined,
        income: undefined,
        goals: [], // Default empty array
        agentId: sampleClient.agentId,
      });
    });

    it('should propagate NotFoundException', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(new NotFoundException('Not found'));
      await expect(service.getClientProfile('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate other errors', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(new Error('DB error'));
      await expect(service.getClientProfile(sampleClient.id)).rejects.toThrow(
        Error,
      );
    });
  });
});
