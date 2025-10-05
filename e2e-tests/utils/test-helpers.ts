import { ApiClient, TestUser, TestClient } from './api-client';

export class TestDataFactory {
  private static userCounter = 0;
  private static clientCounter = 0;

  static createTestUser(overrides?: Partial<TestUser>): TestUser {
    this.userCounter++;
    return {
      email: `testuser${this.userCounter}@finarva.com`,
      password: 'Test123!@#',
      role: 'user',
      ...overrides,
    };
  }

  static createAdminUser(overrides?: Partial<TestUser>): TestUser {
    this.userCounter++;
    return {
      email: `admin${this.userCounter}@finarva.com`,
      password: 'Admin123!@#',
      role: 'admin',
      ...overrides,
    };
  }

  static createTestClient(overrides?: Partial<TestClient>): TestClient {
    this.clientCounter++;
    return {
      name: `Test Client ${this.clientCounter}`,
      email: `client${this.clientCounter}@example.com`,
      phone: `+1234567${String(this.clientCounter).padStart(4, '0')}`,
      occupation: 'Software Engineer',
      incomeLevel: 'MEDIUM',
      goals: ['retirement', 'home_purchase'],
      riskTolerance: 'MODERATE',
      ...overrides,
    };
  }

  static createExpenseData(clientId?: string) {
    return {
      clientId: clientId || 'test-client-id',
      category: 'Food & Dining',
      amount: Math.floor(Math.random() * 500) + 50,
      description: 'Test expense',
      date: new Date().toISOString(),
      isRecurring: false,
      tags: ['test', 'e2e'],
    };
  }

  static createInvestmentData(clientId?: string) {
    return {
      clientId: clientId || 'test-client-id',
      investmentType: 'STOCKS',
      symbol: 'AAPL',
      quantity: 10,
      purchasePrice: 150.00,
      currentPrice: 155.00,
      purchaseDate: new Date().toISOString(),
    };
  }

  static createTaxData() {
    return {
      income: 75000,
      deductions: 12000,
      filingStatus: 'single',
      state: 'CA',
      year: new Date().getFullYear(),
    };
  }

  static createLoanData(clientId?: string) {
    return {
      clientId: clientId || 'test-client-id',
      loanType: 'PERSONAL',
      amount: 25000,
      term: 36,
      purpose: 'Debt Consolidation',
      income: 65000,
      creditScore: 720,
    };
  }

  static createInsuranceData(clientId?: string) {
    return {
      clientId: clientId || 'test-client-id',
      insuranceType: 'LIFE',
      coverage: 500000,
      premium: 200,
      term: 20,
      beneficiaries: ['Spouse'],
    };
  }

  static createQuizAnswers(quizId: string) {
    return {
      quizId,
      answers: [
        { questionId: '1', selectedOption: 'A' },
        { questionId: '2', selectedOption: 'B' },
        { questionId: '3', selectedOption: 'C' },
      ],
      timeSpent: 120, // seconds
    };
  }

  static createLearningProfile() {
    return {
      experience: 'BEGINNER',
      interests: ['investing', 'budgeting', 'retirement'],
      goals: ['learn_basics', 'improve_savings'],
      riskTolerance: 'CONSERVATIVE',
    };
  }

  static createAIRecommendationData(clientId?: string) {
    return {
      clientId: clientId || 'test-client-id',
      financialGoals: ['retirement', 'emergency_fund'],
      currentAssets: 50000,
      monthlyIncome: 5000,
      monthlyExpenses: 3500,
      riskTolerance: 'MODERATE',
      timeHorizon: 10, // years
    };
  }

  static createRandomEmail(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `test${timestamp}${random}@finarva.com`;
  }

  static createRandomPhone(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `+1${areaCode}${prefix}${number}`;
  }

  static resetCounters(): void {
    this.userCounter = 0;
    this.clientCounter = 0;
  }
}

export class DatabaseHelper {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async cleanupTestData(createdIds: {
    users?: string[],
    clients?: string[],
    expenses?: string[],
    investments?: string[]
  }): Promise<void> {
    try {
      // Clean up in reverse order to handle dependencies
      if (createdIds.expenses) {
        for (const id of createdIds.expenses) {
          try {
            await this.apiClient.request('DELETE', `/expenses/${id}`);
          } catch (error) {
            console.warn(`Failed to cleanup expense ${id}:`, error);
          }
        }
      }

      if (createdIds.investments) {
        for (const id of createdIds.investments) {
          try {
            await this.apiClient.request('DELETE', `/investment/${id}`);
          } catch (error) {
            console.warn(`Failed to cleanup investment ${id}:`, error);
          }
        }
      }

      if (createdIds.clients) {
        for (const id of createdIds.clients) {
          try {
            await this.apiClient.deleteClient(id);
          } catch (error) {
            console.warn(`Failed to cleanup client ${id}:`, error);
          }
        }
      }

      if (createdIds.users) {
        for (const id of createdIds.users) {
          try {
            await this.apiClient.request('DELETE', `/auth/users/${id}`);
          } catch (error) {
            console.warn(`Failed to cleanup user ${id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  async waitForDatabase(maxAttempts = 10, delayMs = 1000): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.apiClient.request('GET', '/health');
        return true;
      } catch (error) {
        if (attempt === maxAttempts) {
          console.error('Database not ready after maximum attempts');
          return false;
        }
        console.log(`Database not ready, attempt ${attempt}/${maxAttempts}, retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    return false;
  }
}

export class AssertionHelper {
  static assertResponseStructure(response: any, expectedFields: string[]): void {
    expect(response).toBeDefined();
    expect(response.data).toBeDefined();

    for (const field of expectedFields) {
      expect(response.data).toHaveProperty(field);
    }
  }

  static assertValidationError(response: any, expectedField?: string): void {
    expect(response.status).toBe(400);
    expect(response.data).toHaveProperty('message');

    if (expectedField) {
      expect(response.data.message).toContain(expectedField);
    }
  }

  static assertUnauthorized(response: any): void {
    expect(response.status).toBe(401);
    expect(response.data).toHaveProperty('message');
  }

  static assertNotFound(response: any): void {
    expect(response.status).toBe(404);
    expect(response.data).toHaveProperty('message');
  }

  static assertSuccessResponse(response: any, expectedStatus = 200): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.data).toBeDefined();
  }

  static assertCreatedResponse(response: any): void {
    expect(response.status).toBe(201);
    expect(response.data).toBeDefined();
    expect(response.data).toHaveProperty('id');
  }

  static assertArrayResponse(response: any, minLength = 0): void {
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThanOrEqual(minLength);
  }

  static assertPaginatedResponse(response: any): void {
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data).toHaveProperty('data');
    expect(response.data).toHaveProperty('pagination');
    expect(Array.isArray(response.data.data)).toBe(true);
  }
}
