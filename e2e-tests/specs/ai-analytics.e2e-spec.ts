import { ApiClient } from '../utils/api-client';
import { AuthService, EnvironmentManager } from '../utils/test-services';
import { TestDataFactory, DatabaseHelper, AssertionHelper } from '../utils/test-helpers';
import { sampleAIRecommendationData, sampleAnalyticsFilters } from '../fixtures/test-data';

describe('AI and Analytics E2E Tests', () => {
  let apiClient: ApiClient;
  let authService: AuthService;
  let databaseHelper: DatabaseHelper;
  const envManager = EnvironmentManager.getInstance();
  const createdData = {
    users: [] as string[],
    clients: [] as string[],
    expenses: [] as string[],
  };
  let testClient: any;

  beforeAll(async () => {
    apiClient = new ApiClient(envManager.getApiConfig());
    authService = new AuthService(apiClient);
    databaseHelper = new DatabaseHelper(apiClient);

    // Wait for API to be ready
    const isReady = await databaseHelper.waitForDatabase();
    expect(isReady).toBe(true);

    // Authenticate and create test client with some data
    await authService.authenticateAsUser();
    const clientData = TestDataFactory.createTestClient();
    const clientResponse = await apiClient.createClient(clientData);
    testClient = clientResponse.data;
    createdData.clients.push(testClient.id);

    // Create some sample expenses for analytics
    const expenses = Array.from({ length: 5 }, (_, i) => ({
      ...TestDataFactory.createExpenseData(testClient.id),
      description: `Test expense ${i + 1}`,
      amount: (i + 1) * 100,
    }));

    for (const expense of expenses) {
      const response = await apiClient.createExpense(expense);
      createdData.expenses.push(response.data.id);
    }
  }, 30000);

  afterAll(async () => {
    if (envManager.get('CLEANUP_AFTER_TESTS', true)) {
      await databaseHelper.cleanupTestData(createdData);
    }
    authService.logout();
  });

  describe('AI Recommendations', () => {
    it('should generate financial recommendations', async () => {
      const recommendationData = {
        ...sampleAIRecommendationData,
        clientId: testClient.id,
      };

      const response = await apiClient.getAIRecommendations(recommendationData);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('recommendations');
      expect(Array.isArray(response.data.recommendations)).toBe(true);
      expect(response.data.recommendations.length).toBeGreaterThan(0);

      response.data.recommendations.forEach((rec: any) => {
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('confidence');
      });
    });

    it('should generate investment recommendations', async () => {
      const investmentProfile = {
        clientId: testClient.id,
        riskTolerance: 'MODERATE',
        investmentGoals: ['retirement', 'growth'],
        timeHorizon: 10,
        currentPortfolio: {
          stocks: 60,
          bonds: 30,
          cash: 10,
        },
      };

      const response = await apiClient.request('POST', '/ai/investment-recommendations', investmentProfile);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('recommendations');
      expect(response.data).toHaveProperty('suggestedAllocation');
      expect(response.data).toHaveProperty('reasoning');
    });

    it('should provide budget optimization suggestions', async () => {
      const budgetData = {
        clientId: testClient.id,
        monthlyIncome: 5000,
        expenses: [
          { category: 'Housing', amount: 1500 },
          { category: 'Food', amount: 600 },
          { category: 'Transportation', amount: 400 },
          { category: 'Entertainment', amount: 300 },
        ],
      };

      const response = await apiClient.request('POST', '/ai/budget-optimization', budgetData);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('optimizations');
      expect(response.data).toHaveProperty('potentialSavings');
      expect(response.data).toHaveProperty('riskAssessment');
    });

    it('should analyze spending patterns', async () => {
      const response = await apiClient.request('POST', '/ai/spending-analysis', {
        clientId: testClient.id,
        period: 'last_6_months',
      });

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('patterns');
      expect(response.data).toHaveProperty('trends');
      expect(response.data).toHaveProperty('anomalies');
      expect(response.data).toHaveProperty('insights');
    });

    it('should predict future financial needs', async () => {
      const predictionData = {
        clientId: testClient.id,
        scenarios: ['retirement', 'child_education', 'emergency_fund'],
        timeHorizon: 20,
      };

      const response = await apiClient.request('POST', '/ai/predict', predictionData);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('predictions');
      expect(response.data).toHaveProperty('confidence');
      expect(response.data).toHaveProperty('methodology');
    });

    it('should handle invalid AI request data', async () => {
      try {
        await apiClient.getAIRecommendations({
          clientId: 'invalid-id',
          currentAssets: -1000, // Invalid negative value
        });
        fail('Should have thrown an error for invalid data');
      } catch (error: any) {
        AssertionHelper.assertValidationError(error.response);
      }
    });
  });

  describe('Financial Analytics', () => {
    it('should generate financial summary', async () => {
      const response = await apiClient.getFinancialSummary();

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('totalIncome');
      expect(response.data).toHaveProperty('totalExpenses');
      expect(response.data).toHaveProperty('netWorth');
      expect(response.data).toHaveProperty('cashFlow');
      expect(response.data).toHaveProperty('trends');
    });

    it('should generate sales analytics', async () => {
      const response = await apiClient.getSalesAnalytics();

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('totalSales');
      expect(response.data).toHaveProperty('conversionRate');
      expect(response.data).toHaveProperty('topProducts');
      expect(response.data).toHaveProperty('customerMetrics');
    });

    it('should analyze client demographics', async () => {
      const response = await apiClient.request('GET', '/analytics/client-analytics');

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('totalClients');
      expect(response.data).toHaveProperty('ageDistribution');
      expect(response.data).toHaveProperty('incomeDistribution');
      expect(response.data).toHaveProperty('riskToleranceDistribution');
    });

    it('should analyze expense patterns', async () => {
      const response = await apiClient.request('GET', '/analytics/expense-analytics');

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('categoryBreakdown');
      expect(response.data).toHaveProperty('monthlyTrends');
      expect(response.data).toHaveProperty('averageExpense');
      expect(response.data).toHaveProperty('topExpenseCategories');
    });

    it('should analyze investment performance', async () => {
      const response = await apiClient.request('GET', '/analytics/investment-analytics');

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('totalPortfolioValue');
      expect(response.data).toHaveProperty('performanceMetrics');
      expect(response.data).toHaveProperty('assetAllocation');
      expect(response.data).toHaveProperty('riskMetrics');
    });

    it('should apply date range filters', async () => {
      const filters = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const response = await apiClient.request('GET',
        `/analytics/expense-analytics?startDate=${filters.startDate}&endDate=${filters.endDate}`
      );

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('dateRange');
      expect(response.data.dateRange.startDate).toBe(filters.startDate);
      expect(response.data.dateRange.endDate).toBe(filters.endDate);
    });

    it('should generate dashboard data', async () => {
      const response = await apiClient.request('GET', '/analytics/dashboard');

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('widgets');
      expect(Array.isArray(response.data.widgets)).toBe(true);

      response.data.widgets.forEach((widget: any) => {
        expect(widget).toHaveProperty('type');
        expect(widget).toHaveProperty('data');
        expect(widget).toHaveProperty('title');
      });
    });
  });

  describe('Data Processing and Insights', () => {
    it('should process financial data with AI', async () => {
      const processData = {
        clientId: testClient.id,
        dataType: 'expenses',
        analysisType: 'pattern_recognition',
        parameters: {
          lookbackPeriod: '6_months',
          includeProjections: true,
        },
      };

      const response = await apiClient.processFinancialData(processData);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('analysis');
      expect(response.data).toHaveProperty('insights');
      expect(response.data).toHaveProperty('confidence');
    });

    it('should generate insights from transaction data', async () => {
      const response = await apiClient.request('POST', '/ai/insights', {
        clientId: testClient.id,
        analysisTypes: ['spending_behavior', 'financial_health', 'goal_progress'],
      });

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('insights');
      expect(Array.isArray(response.data.insights)).toBe(true);

      response.data.insights.forEach((insight: any) => {
        expect(insight).toHaveProperty('type');
        expect(insight).toHaveProperty('message');
        expect(insight).toHaveProperty('impact');
        expect(insight).toHaveProperty('actionable');
      });
    });

    it('should optimize financial strategies', async () => {
      const optimizationRequest = {
        clientId: testClient.id,
        goals: ['maximize_savings', 'reduce_risk'],
        constraints: {
          maxRisk: 'MODERATE',
          minLiquidity: 10000,
        },
        timeframe: '12_months',
      };

      const response = await apiClient.request('POST', '/ai/optimize', optimizationRequest);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('strategies');
      expect(response.data).toHaveProperty('projectedOutcomes');
      expect(response.data).toHaveProperty('riskAssessment');
    });
  });

  describe('Real-time Analytics', () => {
    it('should provide real-time market data', async () => {
      const response = await apiClient.request('GET', '/analytics/market-data/real-time');

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('timestamp');
      expect(response.data).toHaveProperty('markets');
      expect(response.data).toHaveProperty('indices');
      expect(response.data).toHaveProperty('currencies');
    });

    it('should stream portfolio updates', async () => {
      const response = await apiClient.request('GET', `/analytics/portfolio/stream/${testClient.id}`);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('portfolioValue');
      expect(response.data).toHaveProperty('dayChange');
      expect(response.data).toHaveProperty('lastUpdate');
    });

    it('should provide performance metrics', async () => {
      const response = await apiClient.request('GET', '/analytics/performance/metrics');

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('responseTime');
      expect(response.data).toHaveProperty('accuracy');
      expect(response.data).toHaveProperty('uptime');
      expect(response.data).toHaveProperty('processingVolume');
    });
  });

  describe('Custom Analytics and Reports', () => {
    it('should create custom analytics query', async () => {
      const customQuery = {
        dataSource: 'expenses',
        filters: {
          clientId: testClient.id,
          dateRange: {
            start: '2024-01-01',
            end: '2024-12-31',
          },
          categories: ['Food & Dining', 'Transportation'],
        },
        aggregations: [
          { field: 'amount', operation: 'sum' },
          { field: 'amount', operation: 'avg' },
          { field: 'category', operation: 'count' },
        ],
        groupBy: ['category', 'month'],
      };

      const response = await apiClient.request('POST', '/analytics/custom-query', customQuery);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('results');
      expect(response.data).toHaveProperty('metadata');
      expect(response.data.results).toBeDefined();
    });

    it('should generate custom report', async () => {
      const reportConfig = {
        title: 'Monthly Expense Report',
        type: 'expense_summary',
        clientId: testClient.id,
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31',
        },
        sections: [
          'summary',
          'category_breakdown',
          'trends',
          'recommendations',
        ],
        format: 'json',
      };

      const response = await apiClient.request('POST', '/analytics/reports/generate', reportConfig);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('report');
      expect(response.data).toHaveProperty('generatedAt');
      expect(response.data.report).toHaveProperty('summary');
    });

    it('should schedule recurring reports', async () => {
      const scheduleConfig = {
        reportType: 'financial_summary',
        clientId: testClient.id,
        frequency: 'monthly',
        deliveryMethod: 'email',
        format: 'pdf',
        includeCharts: true,
      };

      const response = await apiClient.request('POST', '/analytics/reports/schedule', scheduleConfig);

      AssertionHelper.assertCreatedResponse(response);
      expect(response.data).toHaveProperty('scheduleId');
      expect(response.data).toHaveProperty('nextRun');
      expect(response.data).toHaveProperty('status');
    });
  });

  describe('AI Model Performance and Accuracy', () => {
    it('should validate AI model accuracy', async () => {
      const testData = {
        modelType: 'recommendation_engine',
        testCases: [
          {
            input: sampleAIRecommendationData,
            expectedCategories: ['investment', 'savings', 'risk_management'],
          },
        ],
      };

      const response = await apiClient.request('POST', '/ai/validate-model', testData);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('accuracy');
      expect(response.data).toHaveProperty('precision');
      expect(response.data).toHaveProperty('recall');
      expect(response.data.accuracy).toBeGreaterThan(0.7); // Minimum 70% accuracy
    });

    it('should monitor AI prediction quality', async () => {
      const response = await apiClient.request('GET', '/ai/model-metrics');

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('models');

      Object.values(response.data.models).forEach((model: any) => {
        expect(model).toHaveProperty('accuracy');
        expect(model).toHaveProperty('lastTraining');
        expect(model).toHaveProperty('predictionsCount');
        expect(model).toHaveProperty('status');
      });
    });

    it('should handle AI service failures gracefully', async () => {
      // Simulate high load or service unavailability
      const heavyRequest = {
        clientId: testClient.id,
        complexAnalysis: true,
        dataPoints: 100000,
        analysisDepth: 'comprehensive',
      };

      try {
        const response = await apiClient.request('POST', '/ai/heavy-analysis', heavyRequest);
        // If successful, verify response structure
        if (response.status === 200) {
          expect(response.data).toHaveProperty('analysis');
        }
      } catch (error: any) {
        // Service might be temporarily unavailable or rate limited
        expect([503, 429, 500]).toContain(error.response?.status);
      }
    });
  });

  describe('Data Privacy and Security', () => {
    it('should anonymize sensitive data in analytics', async () => {
      const response = await apiClient.request('GET', '/analytics/anonymized-data');

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('data');

      // Verify no sensitive information is exposed
      const dataString = JSON.stringify(response.data);
      expect(dataString).not.toContain('@'); // No email addresses
      expect(dataString).not.toContain('+'); // No phone numbers
      expect(dataString).not.toMatch(/\b\d{4}-\d{4}-\d{4}-\d{4}\b/); // No credit card numbers
    });

    it('should enforce data access permissions', async () => {
      // Try to access another client's analytics data
      try {
        await apiClient.request('GET', `/analytics/client-specific/${'64f7a8b8e1234567890abcde'}`);
        fail('Should have thrown an error for unauthorized access');
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    it('should audit analytics queries', async () => {
      const response = await apiClient.request('GET', '/analytics/audit-log');

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((logEntry: any) => {
        expect(logEntry).toHaveProperty('timestamp');
        expect(logEntry).toHaveProperty('userId');
        expect(logEntry).toHaveProperty('action');
        expect(logEntry).toHaveProperty('resource');
      });
    });
  });
});
