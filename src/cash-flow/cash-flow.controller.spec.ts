
import { Test, TestingModule } from '@nestjs/testing';
import { CashFlowController } from './cash-flow.controller';
import { CashFlowService } from './cash-flow.service';

const mockCashFlowService = {
  analyze: jest.fn(),
  forecast: jest.fn(),
};

describe('CashFlowController', () => {
  let controller: CashFlowController;
  let service: typeof mockCashFlowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CashFlowController],
      providers: [
        {
          provide: CashFlowService,
          useValue: mockCashFlowService,
        },
      ],
    }).compile();

    controller = module.get<CashFlowController>(CashFlowController);
    service = module.get(CashFlowService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAnalysis', () => {
    it('should call analyze service with the correct userId', async () => {
      const userId = 'test-user-id';
      const analysisResult = { totalIncome: 1, totalExpenses: 1, netCashFlow: 0 };
      service.analyze.mockResolvedValue(analysisResult);

      const result = await controller.getAnalysis(userId);

      expect(service.analyze).toHaveBeenCalledWith(userId);
      expect(result).toBe(analysisResult);
    });
  });

  describe('getForecast', () => {
    it('should call forecast service with the correct userId', async () => {
      const userId = 'test-user-id';
      const forecastResult = [{ month: 1, projectedNetCashFlow: 100 }];
      service.forecast.mockResolvedValue(forecastResult);

      const result = await controller.getForecast(userId);

      expect(service.forecast).toHaveBeenCalledWith(userId);
      expect(result).toBe(forecastResult);
    });
  });
});
