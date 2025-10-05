import { ApiClient } from '../utils/api-client';
import { AuthService, EnvironmentManager } from '../utils/test-services';
import { TestDataFactory, DatabaseHelper, AssertionHelper } from '../utils/test-helpers';
import {
  sampleExpenseData,
  sampleRecurringExpenseData,
  sampleInvestmentData,
  sampleTaxData,
  sampleLoanData,
  sampleInsuranceData
} from '../fixtures/test-data';

describe('Financial Services E2E Tests', () => {
  let apiClient: ApiClient;
  let authService: AuthService;
  let databaseHelper: DatabaseHelper;
  const envManager = EnvironmentManager.getInstance();
  const createdData = {
    users: [] as string[],
    clients: [] as string[],
    expenses: [] as string[],
    investments: [] as string[],
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

  describe('Expense Management', () => {
    it('should create a new expense', async () => {
      const expenseData = {
        ...sampleExpenseData,
        clientId: testClient.id,
      };

      const response = await apiClient.createExpense(expenseData);

      AssertionHelper.assertCreatedResponse(response);
      expect(response.data.amount).toBe(expenseData.amount);
      expect(response.data.category).toBe(expenseData.category);
      expect(response.data.clientId).toBe(testClient.id);

      createdData.expenses.push(response.data.id);
    });

    it('should create a recurring expense', async () => {
      const expenseData = {
        ...sampleRecurringExpenseData,
        clientId: testClient.id,
      };

      const response = await apiClient.createExpense(expenseData);

      AssertionHelper.assertCreatedResponse(response);
      expect(response.data.isRecurring).toBe(true);
      expect(response.data.recurringFrequency).toBe('MONTHLY');

      createdData.expenses.push(response.data.id);
    });

    it('should retrieve all expenses', async () => {
      const response = await apiClient.getAllExpenses();

      AssertionHelper.assertArrayResponse(response);
      expect(response.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should retrieve expense by ID', async () => {
      const expenseData = {
        ...sampleExpenseData,
        clientId: testClient.id,
      };
      const createResponse = await apiClient.createExpense(expenseData);
      const expenseId = createResponse.data.id;
      createdData.expenses.push(expenseId);

      const response = await apiClient.getExpenseById(expenseId);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data.id).toBe(expenseId);
    });

    it('should filter expenses by category', async () => {
      const response = await apiClient.request('GET', `/expenses?category=${encodeURIComponent('Food & Dining')}`);

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((expense: any) => {
        expect(expense.category).toBe('Food & Dining');
      });
    });

    it('should get expense summary', async () => {
      const response = await apiClient.request('GET', '/expenses/summary');

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('totalAmount');
      expect(response.data).toHaveProperty('categoryBreakdown');
      expect(typeof response.data.totalAmount).toBe('number');
    });

    it('should reject expense with negative amount', async () => {
      const expenseData = {
        ...sampleExpenseData,
        clientId: testClient.id,
        amount: -100,
      };

      try {
        await apiClient.createExpense(expenseData);
        fail('Should have thrown an error for negative amount');
      } catch (error: any) {
        AssertionHelper.assertValidationError(error.response, 'amount');
      }
    });
  });

  describe('Investment Management', () => {
    it('should create a new investment', async () => {
      const investmentData = {
        ...sampleInvestmentData,
        clientId: testClient.id,
      };

      const response = await apiClient.createInvestment(investmentData);

      AssertionHelper.assertCreatedResponse(response);
      expect(response.data.symbol).toBe(investmentData.symbol);
      expect(response.data.quantity).toBe(investmentData.quantity);
      expect(response.data.clientId).toBe(testClient.id);

      createdData.investments.push(response.data.id);
    });

    it('should retrieve investment portfolio', async () => {
      const response = await apiClient.getInvestmentPortfolio(testClient.id);

      AssertionHelper.assertArrayResponse(response);
      expect(response.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should calculate portfolio performance', async () => {
      const response = await apiClient.request('GET', `/investment/${testClient.id}/performance`);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('totalValue');
      expect(response.data).toHaveProperty('totalGainLoss');
      expect(response.data).toHaveProperty('percentageReturn');
    });

    it('should get market data for symbols', async () => {
      const response = await apiClient.request('GET', '/investment/market-data?symbols=AAPL,GOOGL');

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('AAPL');
      expect(response.data.AAPL).toHaveProperty('currentPrice');
    });

    it('should reject investment with zero quantity', async () => {
      const investmentData = {
        ...sampleInvestmentData,
        clientId: testClient.id,
        quantity: 0,
      };

      try {
        await apiClient.createInvestment(investmentData);
        fail('Should have thrown an error for zero quantity');
      } catch (error: any) {
        AssertionHelper.assertValidationError(error.response, 'quantity');
      }
    });
  });

  describe('Tax Calculations', () => {
    it('should calculate tax for single filer', async () => {
      const response = await apiClient.calculateTax(sampleTaxData);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('taxOwed');
      expect(response.data).toHaveProperty('effectiveRate');
      expect(response.data).toHaveProperty('breakdown');
      expect(typeof response.data.taxOwed).toBe('number');
      expect(response.data.taxOwed).toBeGreaterThan(0);
    });

    it('should get tax history', async () => {
      const response = await apiClient.getTaxHistory();

      AssertionHelper.assertArrayResponse(response);
    });

    it('should generate tax report', async () => {
      const response = await apiClient.generateTaxReport(2024);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/pdf');
    });

    it('should get tax brackets for current year', async () => {
      const response = await apiClient.request('GET', '/tax/brackets?year=2024');

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((bracket: any) => {
        expect(bracket).toHaveProperty('min');
        expect(bracket).toHaveProperty('max');
        expect(bracket).toHaveProperty('rate');
      });
    });

    it('should reject tax calculation with negative income', async () => {
      const taxData = {
        ...sampleTaxData,
        income: -1000,
      };

      try {
        await apiClient.calculateTax(taxData);
        fail('Should have thrown an error for negative income');
      } catch (error: any) {
        AssertionHelper.assertValidationError(error.response, 'income');
      }
    });
  });

  describe('Loan Processing', () => {
    it('should submit loan application', async () => {
      const loanData = {
        ...sampleLoanData,
        clientId: testClient.id,
      };

      const response = await apiClient.applyForLoan(loanData);

      AssertionHelper.assertCreatedResponse(response);
      expect(response.data.amount).toBe(loanData.amount);
      expect(response.data.loanType).toBe(loanData.loanType);
      expect(response.data.status).toBeDefined();
    });

    it('should calculate loan payments', async () => {
      const loanData = {
        amount: 100000,
        term: 60,
        interestRate: 5.5,
      };

      const response = await apiClient.request('POST', '/loans/calculate', loanData);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('monthlyPayment');
      expect(response.data).toHaveProperty('totalInterest');
      expect(response.data).toHaveProperty('totalAmount');
    });

    it('should prequalify for loan', async () => {
      const prequalifyData = {
        income: 75000,
        creditScore: 720,
        existingDebt: 15000,
        requestedAmount: 25000,
      };

      const response = await apiClient.request('POST', '/loans/prequalify', prequalifyData);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('qualified');
      expect(response.data).toHaveProperty('maxAmount');
      expect(response.data).toHaveProperty('estimatedRate');
    });

    it('should reject loan with insufficient income', async () => {
      const loanData = {
        ...sampleLoanData,
        clientId: testClient.id,
        income: 20000,
        amount: 100000, // Amount too high for income
      };

      try {
        await apiClient.applyForLoan(loanData);
        fail('Should have thrown an error for insufficient income');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('income');
      }
    });
  });

  describe('Insurance Management', () => {
    it('should create insurance policy', async () => {
      const insuranceData = {
        ...sampleInsuranceData,
        clientId: testClient.id,
      };

      const response = await apiClient.createInsurance(insuranceData);

      AssertionHelper.assertCreatedResponse(response);
      expect(response.data.insuranceType).toBe(insuranceData.insuranceType);
      expect(response.data.coverage).toBe(insuranceData.coverage);
      expect(response.data.premium).toBe(insuranceData.premium);
    });

    it('should get insurance portfolio', async () => {
      const response = await apiClient.getInsurancePortfolio(testClient.id);

      AssertionHelper.assertArrayResponse(response);
    });

    it('should get insurance quote', async () => {
      const quoteData = {
        insuranceType: 'AUTO',
        coverage: 50000,
        clientProfile: {
          age: 30,
          location: 'CA',
          drivingRecord: 'CLEAN',
        },
      };

      const response = await apiClient.request('POST', '/insurance/quote', quoteData);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('premium');
      expect(response.data).toHaveProperty('deductible');
      expect(response.data).toHaveProperty('coverage');
    });

    it('should get available insurance providers', async () => {
      const response = await apiClient.request('GET', '/insurance/providers?type=LIFE');

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((provider: any) => {
        expect(provider).toHaveProperty('name');
        expect(provider).toHaveProperty('rating');
        expect(provider).toHaveProperty('specialties');
      });
    });
  });

  describe('Cash Flow Analysis', () => {
    it('should get cash flow analysis', async () => {
      const response = await apiClient.getCashFlowAnalysis();

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('monthlyIncome');
      expect(response.data).toHaveProperty('monthlyExpenses');
      expect(response.data).toHaveProperty('netCashFlow');
      expect(response.data).toHaveProperty('trends');
    });

    it('should get cash flow forecast', async () => {
      const response = await apiClient.getCashFlowForecast(12);

      AssertionHelper.assertArrayResponse(response, 12);
      response.data.forEach((month: any) => {
        expect(month).toHaveProperty('month');
        expect(month).toHaveProperty('projectedIncome');
        expect(month).toHaveProperty('projectedExpenses');
        expect(month).toHaveProperty('netFlow');
      });
    });

    it('should get cash flow optimization suggestions', async () => {
      const response = await apiClient.request('GET', '/cash-flow/optimization');

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('suggestions');
      expect(Array.isArray(response.data.suggestions)).toBe(true);
    });
  });

  describe('Financial Data Validation', () => {
    it('should validate expense amounts', async () => {
      const invalidAmounts = [0, -50, 'invalid', null, undefined];

      for (const amount of invalidAmounts) {
        try {
          await apiClient.createExpense({
            ...sampleExpenseData,
            clientId: testClient.id,
            amount: amount as any,
          });
          fail(`Should have rejected invalid amount: ${amount}`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      }
    });

    it('should validate investment quantities', async () => {
      const invalidQuantities = [0, -10, 'invalid', null];

      for (const quantity of invalidQuantities) {
        try {
          await apiClient.createInvestment({
            ...sampleInvestmentData,
            clientId: testClient.id,
            quantity: quantity as any,
          });
          fail(`Should have rejected invalid quantity: ${quantity}`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      }
    });

    it('should validate date formats', async () => {
      const invalidDates = ['invalid-date', '2024-13-45', 'not-a-date'];

      for (const date of invalidDates) {
        try {
          await apiClient.createExpense({
            ...sampleExpenseData,
            clientId: testClient.id,
            date: date,
          });
          fail(`Should have rejected invalid date: ${date}`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      }
    });
  });

  describe('Performance and Concurrency', () => {
    it('should handle multiple concurrent expense creations', async () => {
      const concurrentExpenses = Array.from({ length: 10 }, (_, i) => ({
        ...sampleExpenseData,
        clientId: testClient.id,
        description: `Concurrent expense ${i + 1}`,
        amount: Math.floor(Math.random() * 100) + 10,
      }));

      const createPromises = concurrentExpenses.map(expense =>
        apiClient.createExpense(expense)
      );

      const responses = await Promise.all(createPromises);

      responses.forEach(response => {
        AssertionHelper.assertCreatedResponse(response);
        createdData.expenses.push(response.data.id);
      });
    });

    it('should handle bulk financial data processing', async () => {
      const bulkData = Array.from({ length: 50 }, (_, i) => ({
        type: 'expense',
        data: {
          ...sampleExpenseData,
          clientId: testClient.id,
          description: `Bulk expense ${i + 1}`,
          amount: Math.floor(Math.random() * 200) + 10,
        },
      }));

      const response = await apiClient.request('POST', '/financial/bulk', { items: bulkData });

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('processed');
      expect(response.data).toHaveProperty('successful');
      expect(response.data).toHaveProperty('failed');
    });
  });
});
