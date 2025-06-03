import { Test, TestingModule } from '@nestjs/testing';
import { InsuranceService } from './insurance.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';
import { AiInsuranceInputDto } from './dto/ai-insurance-input.dto';
import { ClientProfileDto } from '../clients/dto/client-profile.dto';

describe('InsuranceService', () => {
  let service: InsuranceService;
  let prisma: PrismaService;
  let aiService: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsuranceService,
        {
          provide: PrismaService,
          useValue: {
            insurance: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: AiService,
          useValue: {
            suggestInsurance: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InsuranceService>(InsuranceService);
    prisma = module.get<PrismaService>(PrismaService);
    aiService = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create insurance with default status', async () => {
    const dto: CreateInsuranceDto = {
      clientId: 'client-1',
      type: 'health',
      amount: 500000,
      premium: 1000,
      termMonths: 24,
      provider: 'ABC Insurance',
      source: 'agent',
      startDate: '2025-06-01T00:00:00.000Z',
      endDate: '2027-06-01T00:00:00.000Z',
      status: 'pending',
    };

    const result = { ...dto, id: 'ins-001' }; // assuming `id` is returned by DB
    jest.spyOn(prisma.insurance, 'create').mockResolvedValue(result as any);

    await expect(service.create(dto)).resolves.toEqual(result);
  });

  it('should return all insurance entries', async () => {
    const result = [{ id: 'i1', client: {} }];
    jest.spyOn(prisma.insurance, 'findMany').mockResolvedValue(result as any);
    await expect(service.findAll()).resolves.toEqual(result);
  });

  it('should return insurance entries by client ID', async () => {
    const result = [{ id: 'i1' }];
    jest.spyOn(prisma.insurance, 'findMany').mockResolvedValue(result as any);
    await expect(service.findAllByClient('client-1')).resolves.toEqual(result);
  });

  it('should return one insurance entry', async () => {
    const result = { id: 'i1' };
    jest.spyOn(prisma.insurance, 'findUnique').mockResolvedValue(result as any);
    await expect(service.findOne('i1')).resolves.toEqual(result);
  });

  it('should update an insurance entry', async () => {
    const dto: UpdateInsuranceDto = { premium: 2000 };
    const result = { id: 'i1', premium: 2000 };
    jest.spyOn(prisma.insurance, 'update').mockResolvedValue(result as any);
    await expect(service.update('i1', dto)).resolves.toEqual(result);
  });

  it('should delete an insurance entry', async () => {
    const result = { id: 'i1' };
    jest.spyOn(prisma.insurance, 'delete').mockResolvedValue(result as any);
    await expect(service.remove('i1')).resolves.toEqual(result);
  });

  it('should call AI service to suggest insurance', async () => {
    const clientProfile: ClientProfileDto = {
      id: 'client123',
      name: 'Jane Doe',
      phone: '9876543210',
      agentId: 'agent42',
      language: 'en',
      goals: ['retirement'],
      age: 40,
      gender: 'female',
      income: 50000,
      interests: ['travel'],
    };

    const dto: AiInsuranceInputDto = {
      clientId: 'client123',
      language: 'en',
      goals: ['retirement'],
      clientProfile,
    };

    const suggestion = 'Health and retirement insurance';
    jest.spyOn(aiService, 'suggestInsurance').mockResolvedValue(suggestion);

    await expect(service.suggestInsurance(dto)).resolves.toBe(suggestion);
  });
});
