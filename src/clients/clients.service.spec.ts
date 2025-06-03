import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

describe('ClientsService', () => {
  let service: ClientsService;
  let prisma: PrismaService;

  const mockPrisma = {
    client: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a client', async () => {
    const dto: CreateClientDto = {
      name: 'John Doe',
      phone: '1234567890',
      language: 'en',
      goals: ['retirement'],
    };
    const agentId = 'agent-1';

    const createdClient = { id: '1', ...dto, agentId };
    mockPrisma.client.create.mockResolvedValue(createdClient);

    const result = await service.create(dto, agentId);
    expect(result).toEqual(createdClient);
    expect(mockPrisma.client.create).toHaveBeenCalledWith({
      data: { ...dto, agentId },
    });
  });

  it('should return clients by agent', async () => {
    mockPrisma.client.findMany.mockResolvedValue([]);
    const result = await service.findAllByAgent('agent-1');
    expect(result).toEqual([]);
    expect(mockPrisma.client.findMany).toHaveBeenCalledWith({
      where: { agentId: 'agent-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return a client by ID', async () => {
    const client = { id: '1', name: 'John' };
    mockPrisma.client.findUnique.mockResolvedValue(client);
    const result = await service.findOne('1');
    expect(result).toEqual(client);
  });

  it('should throw if client not found on findOne', async () => {
    mockPrisma.client.findUnique.mockResolvedValue(null);
    await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
  });

  it('should update a client', async () => {
    const existing = { id: '1', name: 'John' };
    const dto: UpdateClientDto = { name: 'Jane' };
    const updated = { id: '1', name: 'Jane' };

    mockPrisma.client.findUnique.mockResolvedValue(existing);
    mockPrisma.client.update.mockResolvedValue(updated);

    const result = await service.update('1', dto);
    expect(result).toEqual(updated);
  });

  it('should throw if client not found on update', async () => {
    mockPrisma.client.findUnique.mockResolvedValue(null);
    await expect(service.update('1', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete a client', async () => {
    const client = { id: '1', name: 'John' };
    mockPrisma.client.findUnique.mockResolvedValue(client);
    mockPrisma.client.delete.mockResolvedValue(client);
    const result = await service.remove('1');
    expect(result).toEqual(client);
  });

  it('should throw if client not found on delete', async () => {
    mockPrisma.client.findUnique.mockResolvedValue(null);
    await expect(service.remove('1')).rejects.toThrow(NotFoundException);
  });

  it('should get client profile', async () => {
    const client = {
      id: '1',
      name: 'John',
      phone: '123',
      language: 'en',
      age: 30,
      gender: 'male',
      income: 50000,
      goals: ['retirement'],
      agentId: 'agent-1',
    };
    mockPrisma.client.findUnique.mockResolvedValue(client);
    const result = await service.getClientProfile('1');
    expect(result).toEqual({
      id: '1',
      name: 'John',
      phone: '123',
      language: 'en',
      age: 30,
      gender: 'male',
      income: 50000,
      goals: ['retirement'],
      agentId: 'agent-1',
    });
  });
});
