import { Test, TestingModule } from '@nestjs/testing';
import { InsuranceController } from './insurance.controller';
import { InsuranceService } from './insurance.service';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';
import { AiInsuranceInputDto } from './dto/ai-insurance-input.dto';
import { ClientProfileDto } from '../clients/dto/client-profile.dto';

describe('InsuranceController', () => {
  let controller: InsuranceController;
  let service: InsuranceService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllByClient: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    suggestInsurance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsuranceController],
      providers: [
        {
          provide: InsuranceService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<InsuranceController>(InsuranceController);
    service = module.get<InsuranceService>(InsuranceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create insurance', async () => {
    const dto: CreateInsuranceDto = {
      clientId: 'c1',
      type: 'life',
      amount: 100000,
      premium: 5000,
      termMonths: 120,
      provider: 'XYZ Insurance',
      source: 'online',
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2035-01-01T00:00:00.000Z',
      status: 'pending',
    };

    const result = {
      id: 'i1',
      ...dto,
    };

    mockService.create.mockResolvedValue(result);
    await expect(controller.create(dto)).resolves.toEqual(result);
  });
  

  it('should return all insurance', async () => {
    const result = [{ id: 'i1' }];
    mockService.findAll.mockResolvedValue(result);
    await expect(controller.findAll()).resolves.toEqual(result);
  });

  it('should return insurance by client ID', async () => {
    const result = [{ id: 'i2' }];
    mockService.findAllByClient.mockResolvedValue(result);
    await expect(controller.findByClient('client-1')).resolves.toEqual(result);
  });

  it('should return insurance by ID', async () => {
    const result = { id: 'i3' };
    mockService.findOne.mockResolvedValue(result);
    await expect(controller.findOne('i3')).resolves.toEqual(result);
  });

  it('should update insurance by ID', async () => {
    const dto: UpdateInsuranceDto = { premium: 8000 };
    const result = { id: 'i4', premium: 8000 };
    mockService.update.mockResolvedValue(result);
    await expect(controller.update('i4', dto)).resolves.toEqual(result);
  });

  it('should return insurance suggestion', async () => {
    const clientProfile: ClientProfileDto = {
      id: 'client1',
      name: 'John Doe', 
      phone: '1234567890', 
      agentId: 'agent1', 
      language: 'en',
      goals: ['child education', 'retirement'],
      age: 35,
      gender: 'male',
      income: 60000,
      interests: ['sports'], // optional, add any dummy value or remove if not needed
    };

    const dto: AiInsuranceInputDto = {
      clientId: 'c1',
      age: 35,
      gender: 'male',
      monthlyIncome: 60000,
      existingInsuranceTypes: ['health'],
      goals: ['retirement', 'child education'],
      dependents: ['spouse', '1 child'],
      location: 'urban',
      occupation: 'engineer',
      healthStatus: 'fit',
      language: 'en',
      clientProfile, 
    };

    const suggestion =
      'Child education plan with long-term benefits recommended';

    mockService.suggestInsurance.mockResolvedValue(suggestion);

    await expect(controller.suggestInsurance(dto)).resolves.toEqual(suggestion);
  });
  
});
