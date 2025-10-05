import { ApiClient } from '../utils/api-client';
import { AuthService, EnvironmentManager, WaitHelper } from '../utils/test-services';
import { TestDataFactory, AssertionHelper } from '../utils/test-helpers';

describe('Performance and Load E2E Tests', () => {
  let apiClient: ApiClient;
  let authService: AuthService;
  const envManager = EnvironmentManager.getInstance();
  let testClient: any;

  beforeAll(async () => {
    apiClient = new ApiClient(envManager.getApiConfig());
    authService = new AuthService(apiClient);

    await authService.authenticateAsUser();
    const clientData = TestDataFactory.createTestClient();
    const clientResponse = await apiClient.createClient(clientData);
    testClient = clientResponse.data;
  }, 30000);

  afterAll(() => {
    authService.logout();
  });

  describe('API Response Time Tests', () => {
    const measureResponseTime = async (operation: () => Promise<any>): Promise<number> => {
      const startTime = Date.now();
      await operation();
      return Date.now() - startTime;
    };

    it('should respond to authentication within acceptable time', async () => {
      const responseTime = await measureResponseTime(async () => {
        await apiClient.getProfile();
      });

      expect(responseTime).toBeLessThan(2000); // 2 seconds
    });

    it('should respond to client operations within acceptable time', async () => {
      const responseTime = await measureResponseTime(async () => {
        await apiClient.getAllClients();
      });

      expect(responseTime).toBeLessThan(3000); // 3 seconds
    });

    it('should respond to financial calculations within acceptable time', async () => {
      const taxData = TestDataFactory.createTaxData();

      const responseTime = await measureResponseTime(async () => {
        await apiClient.calculateTax(taxData);
      });

      expect(responseTime).toBeLessThan(5000); // 5 seconds for complex calculations
    });

    it('should respond to AI recommendations within acceptable time', async () => {
      const aiData = TestDataFactory.createAIRecommendationData(testClient.id);

      const responseTime = await measureResponseTime(async () => {
        await apiClient.getAIRecommendations(aiData);
      });

      expect(responseTime).toBeLessThan(10000); // 10 seconds for AI processing
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle concurrent authentication requests', async () => {
      const concurrentRequests = 10;
      const promises = Array.from({ length: concurrentRequests }, () =>
        apiClient.getProfile()
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        AssertionHelper.assertSuccessResponse(response);
      });
    });

    it('should handle concurrent client creation', async () => {
      const concurrentRequests = 5;
      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        apiClient.createClient(TestDataFactory.createTestClient({
          email: `concurrent${i}@test.com`
        }))
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        AssertionHelper.assertCreatedResponse(response);
      });
    });

    it('should handle concurrent expense operations', async () => {
      const concurrentRequests = 15;
      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        apiClient.createExpense({
          ...TestDataFactory.createExpenseData(testClient.id),
          description: `Concurrent expense ${i + 1}`,
          amount: Math.floor(Math.random() * 500) + 10,
        })
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        AssertionHelper.assertCreatedResponse(response);
      });
    });

    it('should handle mixed concurrent operations', async () => {
      const operations = [
        () => apiClient.getAllClients(),
        () => apiClient.getAllExpenses(),
        () => apiClient.getProfile(),
        () => apiClient.getFinancialSummary(),
        () => apiClient.request('GET', '/health'),
      ];

      const promises = Array.from({ length: 20 }, (_, i) => {
        const operation = operations[i % operations.length];
        return operation();
      });

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        AssertionHelper.assertSuccessResponse(response);
      });
    });
  });

  describe('Bulk Operations Performance', () => {
    it('should handle bulk client creation efficiently', async () => {
      const bulkSize = 50;
      const clients = Array.from({ length: bulkSize }, (_, i) =>
        TestDataFactory.createTestClient({
          email: `bulk${i}@test.com`,
          name: `Bulk Client ${i + 1}`,
        })
      );

      const startTime = Date.now();
      const promises = clients.map(client => apiClient.createClient(client));
      const responses = await Promise.all(promises);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(30000); // 30 seconds for 50 clients
      expect(responses.length).toBe(bulkSize);

      responses.forEach(response => {
        AssertionHelper.assertCreatedResponse(response);
      });
    });

    it('should handle bulk expense creation efficiently', async () => {
      const bulkSize = 100;
      const expenses = Array.from({ length: bulkSize }, (_, i) => ({
        ...TestDataFactory.createExpenseData(testClient.id),
        description: `Bulk expense ${i + 1}`,
        amount: Math.floor(Math.random() * 200) + 10,
      }));

      const startTime = Date.now();
      const promises = expenses.map(expense => apiClient.createExpense(expense));
      const responses = await Promise.all(promises);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(45000); // 45 seconds for 100 expenses
      expect(responses.length).toBe(bulkSize);

      responses.forEach(response => {
        AssertionHelper.assertCreatedResponse(response);
      });
    });

    it('should process bulk data analysis efficiently', async () => {
      // Create bulk analysis request
      const analysisData = {
        clientIds: [testClient.id],
        analysisTypes: ['expense_patterns', 'spending_trends', 'budget_optimization'],
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31',
        },
      };

      const startTime = Date.now();
      const response = await apiClient.request('POST', '/analytics/bulk-analysis', analysisData);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(20000); // 20 seconds for bulk analysis
      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('analysis');
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should handle large data retrieval without memory issues', async () => {
      // Request large dataset
      const response = await apiClient.request('GET', '/expenses?limit=1000');

      AssertionHelper.assertArrayResponse(response);
      expect(response.data.length).toBeLessThanOrEqual(1000);
    });

    it('should handle complex analytics queries efficiently', async () => {
      const complexQuery = {
        aggregations: [
          { field: 'amount', operation: 'sum', groupBy: 'category' },
          { field: 'amount', operation: 'avg', groupBy: 'month' },
          { field: 'amount', operation: 'count', groupBy: 'client' },
        ],
        filters: {
          dateRange: {
            start: '2024-01-01',
            end: '2024-12-31',
          },
          amountRange: {
            min: 0,
            max: 10000,
          },
        },
        sorting: [
          { field: 'amount', direction: 'desc' },
          { field: 'date', direction: 'asc' },
        ],
      };

      const startTime = Date.now();
      const response = await apiClient.request('POST', '/analytics/complex-query', complexQuery);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(15000); // 15 seconds for complex query
      AssertionHelper.assertSuccessResponse(response);
    });

    it('should maintain stable memory usage during sustained operations', async () => {
      // Perform sustained operations
      const iterations = 20;
      const operations = [];

      for (let i = 0; i < iterations; i++) {
        operations.push(async () => {
          await apiClient.getAllClients();
          await WaitHelper.sleep(100); // Small delay between operations
          await apiClient.getAllExpenses();
          await WaitHelper.sleep(100);
          await apiClient.getFinancialSummary();
        });
      }

      // Execute operations sequentially to simulate sustained load
      for (const operation of operations) {
        await operation();
      }

      // Verify system is still responsive
      const finalResponse = await apiClient.request('GET', '/health/metrics');
      AssertionHelper.assertSuccessResponse(finalResponse);
      expect(finalResponse.data).toHaveProperty('memory');
    });
  });

  describe('Database Performance', () => {
    it('should handle complex database queries efficiently', async () => {
      const complexFilter = {
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31',
        },
        categories: ['Food & Dining', 'Transportation', 'Entertainment'],
        amountRange: {
          min: 50,
          max: 500,
        },
        sortBy: 'amount',
        sortOrder: 'desc',
        page: 1,
        limit: 100,
      };

      const startTime = Date.now();
      const response = await apiClient.request('GET', '/expenses', { params: complexFilter });
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // 5 seconds for complex DB query
      AssertionHelper.assertArrayResponse(response);
    });

    it('should handle aggregation queries efficiently', async () => {
      const aggregationQuery = {
        pipeline: [
          { $match: { clientId: testClient.id } },
          { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
          { $sort: { total: -1 } },
          { $limit: 10 },
        ],
      };

      const startTime = Date.now();
      const response = await apiClient.request('POST', '/analytics/aggregate', aggregationQuery);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(3000); // 3 seconds for aggregation
      AssertionHelper.assertArrayResponse(response);
    });

    it('should maintain consistent performance with data growth', async () => {
      // Create additional test data
      const additionalExpenses = Array.from({ length: 200 }, (_, i) => ({
        ...TestDataFactory.createExpenseData(testClient.id),
        description: `Performance test expense ${i + 1}`,
        amount: Math.floor(Math.random() * 300) + 10,
      }));

      // Create expenses in batches to avoid overwhelming the system
      const batchSize = 20;
      for (let i = 0; i < additionalExpenses.length; i += batchSize) {
        const batch = additionalExpenses.slice(i, i + batchSize);
        const promises = batch.map(expense => apiClient.createExpense(expense));
        await Promise.all(promises);
        await WaitHelper.sleep(100); // Small delay between batches
      }

      // Test query performance after data growth
      const startTime = Date.now();
      const response = await apiClient.getAllExpenses();
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should still be under 5 seconds
      AssertionHelper.assertArrayResponse(response);
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from temporary service disruptions', async () => {
      // Simulate rapid requests that might cause temporary issues
      const rapidRequests = Array.from({ length: 50 }, () =>
        apiClient.getProfile().catch(e => e)
      );

      const results = await Promise.all(rapidRequests);

      // At least 80% should succeed
      const successful = results.filter(result => result.status === 200).length;
      expect(successful / rapidRequests.length).toBeGreaterThan(0.8);
    });

    it('should handle timeout scenarios gracefully', async () => {
      // Test with a potentially slow operation
      try {
        const response = await apiClient.request('GET', '/analytics/comprehensive-report', {
          timeout: 30000, // 30 second timeout
        });
        AssertionHelper.assertSuccessResponse(response);
      } catch (error: any) {
        // If it times out, ensure proper error handling
        expect([408, 504]).toContain(error.response?.status);
      }
    });

    it('should maintain data consistency under load', async () => {
      const clientData = TestDataFactory.createTestClient();
      const createResponse = await apiClient.createClient(clientData);
      const createdClientId = createResponse.data.id;

      // Perform multiple concurrent updates
      const updates = Array.from({ length: 10 }, (_, i) => ({
        name: `Updated Name ${i + 1}`,
        phone: TestDataFactory.createRandomPhone(),
      }));

      const updatePromises = updates.map(update =>
        apiClient.updateClient(createdClientId, update).catch(e => e)
      );

      const results = await Promise.all(updatePromises);

      // At least one update should succeed
      const successful = results.filter(result => result.status === 200);
      expect(successful.length).toBeGreaterThan(0);

      // Verify final state is consistent
      const finalState = await apiClient.getClientById(createdClientId);
      AssertionHelper.assertSuccessResponse(finalState);
      expect(finalState.data).toHaveProperty('name');
    });
  });

  describe('Scalability Tests', () => {
    it('should demonstrate horizontal scaling capabilities', async () => {
      // Test with increasing load patterns
      const loadLevels = [5, 10, 20, 30];
      const results: number[] = [];

      for (const level of loadLevels) {
        const promises = Array.from({ length: level }, () =>
          apiClient.getProfile()
        );

        const startTime = Date.now();
        await Promise.all(promises);
        const duration = Date.now() - startTime;

        results.push(duration);
      }

      // Response time shouldn't increase dramatically with load
      const responseTimeGrowth = results[results.length - 1] / results[0];
      expect(responseTimeGrowth).toBeLessThan(5); // No more than 5x increase
    });

    it('should handle user session scaling', async () => {
      // Create multiple user sessions
      const userCount = 10;
      const userSessions = [];

      for (let i = 0; i < userCount; i++) {
        const userClient = new ApiClient(envManager.getApiConfig());
        const userAuth = new AuthService(userClient);

        await userAuth.authenticateAsUser(
          `testuser${i}@finarva.com`,
          'Test123!@#'
        );

        userSessions.push(userClient);
      }

      // Perform operations with all sessions concurrently
      const promises = userSessions.map(client => client.getProfile());
      const responses = await Promise.all(promises);

      responses.forEach(response => {
        AssertionHelper.assertSuccessResponse(response);
      });
    });
  });
});
