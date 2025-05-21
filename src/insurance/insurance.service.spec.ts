import { Test, TestingModule } from '@nestjs/testing';
import { InsuranceService } from './insurance.service';

describe('InsuranceService', () => {
  let service: InsuranceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsuranceService],
    }).compile();

    service = module.get<InsuranceService>(InsuranceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
