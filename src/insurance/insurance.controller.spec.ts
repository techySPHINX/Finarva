import { Test, TestingModule } from '@nestjs/testing';
import { InsuranceController } from './insurance.controller';

describe('InsuranceController', () => {
  let controller: InsuranceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsuranceController],
    }).compile();

    controller = module.get<InsuranceController>(InsuranceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
