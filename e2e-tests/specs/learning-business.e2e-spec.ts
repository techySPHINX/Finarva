import { ApiClient } from '../utils/api-client';
import { AuthService, EnvironmentManager } from '../utils/test-services';
import { TestDataFactory, DatabaseHelper, AssertionHelper } from '../utils/test-helpers';
import {
  sampleLearningContent,
  sampleLearningProfile,
  sampleQuizData,
  sampleQuizAnswers,
  sampleInventoryData
} from '../fixtures/test-data';

describe('Learning and Business Operations E2E Tests', () => {
  let apiClient: ApiClient;
  let authService: AuthService;
  let databaseHelper: DatabaseHelper;
  const envManager = EnvironmentManager.getInstance();
  const createdData = {
    users: [] as string[],
    clients: [] as string[],
    quizzes: [] as string[],
    inventory: [] as string[],
  };
  let testClient: any;

  beforeAll(async () => {
    apiClient = new ApiClient(envManager.getApiConfig());
    authService = new AuthService(apiClient);
    databaseHelper = new DatabaseHelper(apiClient);

    // Wait for API to be ready
    const isReady = await databaseHelper.waitForDatabase();
    expect(isReady).toBe(true);

    // Authenticate and create test client
    await authService.authenticateAsUser();
    const clientData = TestDataFactory.createTestClient();
    const clientResponse = await apiClient.createClient(clientData);
    testClient = clientResponse.data;
    createdData.clients.push(testClient.id);
  }, 30000);

  afterAll(async () => {
    if (envManager.get('CLEANUP_AFTER_TESTS', true)) {
      await databaseHelper.cleanupTestData(createdData);
    }
    authService.logout();
  });

  describe('Learning Management', () => {
    it('should retrieve learning content', async () => {
      const response = await apiClient.getLearningContent();

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((content: any) => {
        expect(content).toHaveProperty('id');
        expect(content).toHaveProperty('title');
        expect(content).toHaveProperty('type');
        expect(content).toHaveProperty('difficulty');
        expect(content).toHaveProperty('category');
      });
    });

    it('should get personalized learning content', async () => {
      const response = await apiClient.getPersonalizedContent(sampleLearningProfile);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('recommendations');
      expect(response.data).toHaveProperty('learningPath');
      expect(Array.isArray(response.data.recommendations)).toBe(true);
    });

    it('should filter content by difficulty level', async () => {
      const response = await apiClient.request('GET', '/learning?difficulty=BEGINNER');

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((content: any) => {
        expect(content.difficulty).toBe('BEGINNER');
      });
    });

    it('should filter content by category', async () => {
      const response = await apiClient.request('GET', '/learning?category=INVESTING');

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((content: any) => {
        expect(content.category).toBe('INVESTING');
      });
    });

    it('should track learning progress', async () => {
      const progressData = {
        contentId: 'sample-content-id',
        progress: 75,
        timeSpent: 1800, // 30 minutes
        completed: false,
      };

      const response = await apiClient.request('POST', '/learning/progress', progressData);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('updated');
      expect(response.data.updated).toBe(true);
    });

    it('should get user learning progress', async () => {
      const response = await apiClient.request('GET', '/learning/progress');

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((progress: any) => {
        expect(progress).toHaveProperty('contentId');
        expect(progress).toHaveProperty('progress');
        expect(progress).toHaveProperty('lastAccessed');
      });
    });

    it('should recommend learning based on goals', async () => {
      const goals = {
        goals: ['retirement_planning', 'investment_basics', 'tax_optimization'],
        timeAvailable: 60, // minutes per week
        preferredFormat: ['article', 'video'],
      };

      const response = await apiClient.request('POST', '/learning/recommendations', goals);

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((recommendation: any) => {
        expect(recommendation).toHaveProperty('content');
        expect(recommendation).toHaveProperty('relevanceScore');
        expect(recommendation).toHaveProperty('estimatedTime');
      });
    });
  });

  describe('Quiz System', () => {
    let createdQuizId: string;

    it('should retrieve available quizzes', async () => {
      const response = await apiClient.getQuizzes();

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((quiz: any) => {
        expect(quiz).toHaveProperty('id');
        expect(quiz).toHaveProperty('title');
        expect(quiz).toHaveProperty('difficulty');
        expect(quiz).toHaveProperty('questionCount');
      });
    });

    it('should create a new quiz (admin only)', async () => {
      // Note: This might require admin privileges
      try {
        const response = await apiClient.request('POST', '/quiz', sampleQuizData);

        AssertionHelper.assertCreatedResponse(response);
        expect(response.data.title).toBe(sampleQuizData.title);
        expect(response.data.questions.length).toBe(sampleQuizData.questions.length);

        createdQuizId = response.data.id;
        createdData.quizzes.push(createdQuizId);
      } catch (error: any) {
        // If user doesn't have admin privileges, expect 403
        if (error.response?.status === 403) {
          console.log('Quiz creation requires admin privileges - test skipped');
        } else {
          throw error;
        }
      }
    });

    it('should get quiz by ID', async () => {
      // Use existing quiz or created one
      const quizzes = await apiClient.getQuizzes();
      if (quizzes.data.length === 0) {
        console.log('No quizzes available for testing');
        return;
      }

      const quizId = createdQuizId || quizzes.data[0].id;
      const response = await apiClient.request('GET', `/quiz/${quizId}`);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('title');
      expect(response.data).toHaveProperty('questions');
    });

    it('should submit quiz attempt', async () => {
      const quizzes = await apiClient.getQuizzes();
      if (quizzes.data.length === 0) {
        console.log('No quizzes available for testing');
        return;
      }

      const quizId = createdQuizId || quizzes.data[0].id;
      const answers = {
        ...sampleQuizAnswers,
        quizId,
      };

      const response = await apiClient.submitQuizAttempt(quizId, answers);

      AssertionHelper.assertCreatedResponse(response);
      expect(response.data).toHaveProperty('score');
      expect(response.data).toHaveProperty('totalQuestions');
      expect(response.data).toHaveProperty('correctAnswers');
      expect(response.data).toHaveProperty('timeSpent');
    });

    it('should get quiz results', async () => {
      const quizzes = await apiClient.getQuizzes();
      if (quizzes.data.length === 0) {
        console.log('No quizzes available for testing');
        return;
      }

      const quizId = createdQuizId || quizzes.data[0].id;
      const response = await apiClient.request('GET', `/quiz/${quizId}/results`);

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((result: any) => {
        expect(result).toHaveProperty('attemptId');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('completedAt');
      });
    });

    it('should get quiz leaderboard', async () => {
      const response = await apiClient.request('GET', '/quiz/leaderboard');

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((entry: any) => {
        expect(entry).toHaveProperty('userId');
        expect(entry).toHaveProperty('totalScore');
        expect(entry).toHaveProperty('quizzesCompleted');
        expect(entry).toHaveProperty('rank');
      });
    });

    it('should filter quizzes by category', async () => {
      const response = await apiClient.request('GET', '/quiz?category=financial_literacy');

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((quiz: any) => {
        expect(quiz.category).toBe('financial_literacy');
      });
    });

    it('should filter quizzes by difficulty', async () => {
      const response = await apiClient.request('GET', '/quiz?difficulty=BEGINNER');

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((quiz: any) => {
        expect(quiz.difficulty).toBe('BEGINNER');
      });
    });
  });

  describe('Inventory Management', () => {
    it('should create inventory item', async () => {
      const response = await apiClient.request('POST', '/inventory', sampleInventoryData);

      AssertionHelper.assertCreatedResponse(response);
      expect(response.data.name).toBe(sampleInventoryData.name);
      expect(response.data.quantity).toBe(sampleInventoryData.quantity);
      expect(response.data.unitPrice).toBe(sampleInventoryData.unitPrice);

      createdData.inventory.push(response.data.id);
    });

    it('should retrieve all inventory items', async () => {
      const response = await apiClient.request('GET', '/inventory');

      AssertionHelper.assertArrayResponse(response);
      expect(response.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should get inventory item by ID', async () => {
      const createResponse = await apiClient.request('POST', '/inventory', {
        ...sampleInventoryData,
        name: 'Test Item for Retrieval',
      });
      const itemId = createResponse.data.id;
      createdData.inventory.push(itemId);

      const response = await apiClient.request('GET', `/inventory/${itemId}`);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data.id).toBe(itemId);
    });

    it('should update inventory item', async () => {
      const createResponse = await apiClient.request('POST', '/inventory', {
        ...sampleInventoryData,
        name: 'Item to Update',
      });
      const itemId = createResponse.data.id;
      createdData.inventory.push(itemId);

      const updateData = {
        quantity: 75,
        unitPrice: 30.00,
      };

      const response = await apiClient.request('PATCH', `/inventory/${itemId}`, updateData);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data.quantity).toBe(updateData.quantity);
      expect(response.data.unitPrice).toBe(updateData.unitPrice);
    });

    it('should delete inventory item', async () => {
      const createResponse = await apiClient.request('POST', '/inventory', {
        ...sampleInventoryData,
        name: 'Item to Delete',
      });
      const itemId = createResponse.data.id;

      const deleteResponse = await apiClient.request('DELETE', `/inventory/${itemId}`);
      AssertionHelper.assertSuccessResponse(deleteResponse);

      // Verify item is deleted
      try {
        await apiClient.request('GET', `/inventory/${itemId}`);
        fail('Should have thrown an error for deleted item');
      } catch (error: any) {
        AssertionHelper.assertNotFound(error.response);
      }
    });

    it('should get low stock items', async () => {
      // Create item with low stock
      const lowStockItem = {
        ...sampleInventoryData,
        name: 'Low Stock Item',
        quantity: 5,
        reorderLevel: 10,
      };

      const createResponse = await apiClient.request('POST', '/inventory', lowStockItem);
      createdData.inventory.push(createResponse.data.id);

      const response = await apiClient.request('GET', '/inventory/low-stock');

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((item: any) => {
        expect(item.quantity).toBeLessThanOrEqual(item.reorderLevel);
      });
    });

    it('should calculate inventory valuation', async () => {
      const response = await apiClient.request('GET', '/inventory/valuation');

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('totalValue');
      expect(response.data).toHaveProperty('itemCount');
      expect(response.data).toHaveProperty('categoryBreakdown');
      expect(typeof response.data.totalValue).toBe('number');
    });

    it('should filter inventory by category', async () => {
      const response = await apiClient.request('GET', '/inventory?category=OFFICE');

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((item: any) => {
        expect(item.category).toBe('OFFICE');
      });
    });
  });

  describe('Merchant Assistant', () => {
    it('should analyze business performance', async () => {
      const analysisData = {
        businessId: testClient.id,
        metrics: ['revenue', 'customer_satisfaction', 'operational_efficiency'],
        timeframe: 'last_quarter',
      };

      const response = await apiClient.request('POST', '/merchant-assistant/analyze', analysisData);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('analysis');
      expect(response.data).toHaveProperty('recommendations');
      expect(response.data).toHaveProperty('benchmarks');
    });

    it('should get business recommendations', async () => {
      const response = await apiClient.request('GET', `/merchant-assistant/recommendations?businessId=${testClient.id}`);

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((recommendation: any) => {
        expect(recommendation).toHaveProperty('type');
        expect(recommendation).toHaveProperty('description');
        expect(recommendation).toHaveProperty('priority');
        expect(recommendation).toHaveProperty('expectedImpact');
      });
    });

    it('should optimize business operations', async () => {
      const optimizationRequest = {
        businessId: testClient.id,
        areas: ['inventory', 'pricing', 'customer_service'],
        goals: ['increase_profit', 'improve_efficiency'],
      };

      const response = await apiClient.request('POST', '/merchant-assistant/optimization', optimizationRequest);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('optimizations');
      expect(response.data).toHaveProperty('projectedBenefits');
      expect(response.data).toHaveProperty('implementationPlan');
    });

    it('should provide business insights', async () => {
      const response = await apiClient.request('GET', `/merchant-assistant/insights?businessId=${testClient.id}`);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('insights');
      expect(response.data).toHaveProperty('trends');
      expect(response.data).toHaveProperty('opportunities');
      expect(response.data).toHaveProperty('risks');
    });
  });

  describe('Reporting System', () => {
    it('should generate standard reports', async () => {
      const reportConfig = {
        type: 'financial_summary',
        format: 'json',
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31',
        },
        includeCharts: false,
      };

      const response = await apiClient.request('POST', '/reporting/generate', reportConfig);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('report');
      expect(response.data).toHaveProperty('generatedAt');
      expect(response.data).toHaveProperty('reportId');
    });

    it('should get available report templates', async () => {
      const response = await apiClient.request('GET', '/reporting/templates');

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((template: any) => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('parameters');
      });
    });

    it('should schedule recurring reports', async () => {
      const scheduleConfig = {
        templateId: 'financial_summary',
        frequency: 'monthly',
        deliveryMethod: 'email',
        recipients: ['test@example.com'],
        parameters: {
          clientId: testClient.id,
          format: 'pdf',
        },
      };

      const response = await apiClient.request('POST', '/reporting/scheduled', scheduleConfig);

      AssertionHelper.assertCreatedResponse(response);
      expect(response.data).toHaveProperty('scheduleId');
      expect(response.data).toHaveProperty('nextRun');
    });

    it('should export report in different formats', async () => {
      const exportConfig = {
        reportType: 'expense_summary',
        format: 'csv',
        filters: {
          clientId: testClient.id,
          dateRange: {
            start: '2024-01-01',
            end: '2024-12-31',
          },
        },
      };

      const response = await apiClient.request('POST', '/reporting/export', exportConfig);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
    });
  });

  describe('System Health and Monitoring', () => {
    it('should check system health', async () => {
      const response = await apiClient.request('GET', '/health');

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('timestamp');
      expect(response.data).toHaveProperty('uptime');
      expect(response.data.status).toBe('healthy');
    });

    it('should check database connectivity', async () => {
      const response = await apiClient.request('GET', '/health/readiness');

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('database');
      expect(response.data).toHaveProperty('cache');
      expect(response.data).toHaveProperty('services');
    });

    it('should get system metrics', async () => {
      const response = await apiClient.request('GET', '/health/metrics');

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('memory');
      expect(response.data).toHaveProperty('cpu');
      expect(response.data).toHaveProperty('requests');
      expect(response.data).toHaveProperty('errors');
    });
  });
});
