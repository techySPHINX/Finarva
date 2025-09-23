
import { Test, TestingModule } from '@nestjs/testing';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';

const mockReportingService = {
  generateReport: jest.fn(),
};

describe('ReportingController', () => {
  let controller: ReportingController;
  let service: typeof mockReportingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportingController],
      providers: [
        {
          provide: ReportingService,
          useValue: mockReportingService,
        },
      ],
    }).compile();

    controller = module.get<ReportingController>(ReportingController);
    service = module.get(ReportingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should call generateReport service with the correct userId', async () => {
      const userId = 'test-user-id';
      const reportResult = { totalExpenses: 100, totalInvestments: 200, totalLoans: 50, totalInventoryValue: 300 };
      service.generateReport.mockResolvedValue(reportResult);

      const result = await controller.getSummary(userId);

      expect(service.generateReport).toHaveBeenCalledWith(userId);
      expect(result).toBe(reportResult);
    });
  });
});
