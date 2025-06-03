import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { AiService } from '../ai/ai.service';
import { NotFoundException } from '@nestjs/common';

describe('ClientsController', () => {
  let controller: ClientsController;
  let clientsService: ClientsService;
  let aiService: AiService;

  const mockClientsService = {
    create: jest.fn(),
    findAllByAgent: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockAiService = {
    analyzeProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        { provide: ClientsService, useValue: mockClientsService },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
    clientsService = module.get<ClientsService>(ClientsService);
    aiService = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a client', async () => {
    const dto = {
      name: 'John',
      phone: '123',
      language: 'en',
      goals: [],
    };
    mockClientsService.create.mockResolvedValue({
      id: '1',
      ...dto,
      agentId: 'agent-1',
    });
    const result = await controller.create(dto, { user: { id: 'agent-1' } });
    expect(result).toEqual({ id: '1', ...dto, agentId: 'agent-1' });
  });

  it('should get all clients for agent', async () => {
    mockClientsService.findAllByAgent.mockResolvedValue([]);
    const result = await controller.findAll({ user: { id: 'agent-1' } });
    expect(result).toEqual([]);
  });

  it('should get one client', async () => {
    const client = { id: '1', name: 'John' };
    mockClientsService.findOne.mockResolvedValue(client);
    const result = await controller.findOne('1');
    expect(result).toEqual(client);
  });

  it('should update a client', async () => {
    const dto = { name: 'Updated' };
    const updated = { id: '1', ...dto };
    mockClientsService.update.mockResolvedValue(updated);
    const result = await controller.update('1', dto);
    expect(result).toEqual(updated);
  });

  it('should remove a client', async () => {
    const removed = { id: '1' };
    mockClientsService.remove.mockResolvedValue(removed);
    const result = await controller.remove('1');
    expect(result).toEqual(removed);
  });

  it('should return AI insights for a client', async () => {
    const client = {
      id: '1',
      name: 'John',
      phone: '123',
      agentId: 'agent-1',
      preferredLanguage: 'en',
      goals: ['retirement'],
    };

    const aiResponse = { insights: 'Mock AI result' };
    mockClientsService.findOne.mockResolvedValue(client);
    mockAiService.analyzeProfile.mockResolvedValue(aiResponse);

    const result = await controller.getClientAiInsights('1');
    expect(result).toEqual(aiResponse);
  });

  it('should throw NotFoundException for non-existent client insights', async () => {
    mockClientsService.findOne.mockResolvedValue(null);
    await expect(controller.getClientAiInsights('999')).rejects.toThrow(
      NotFoundException,
    );
  });
});
