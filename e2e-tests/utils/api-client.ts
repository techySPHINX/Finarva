import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface TestUser {
  id?: string;
  email: string;
  password: string;
  role?: string;
}

export interface TestClient {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  agentId?: string;
  occupation?: string;
  incomeLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  goals?: string[];
  riskTolerance?: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
}

export class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Server responded with error status
          console.error(`API Error ${error.response.status}:`, error.response.data);
        } else if (error.request) {
          // Request was made but no response received
          console.error('Network Error:', error.message);
        } else {
          // Something else happened
          console.error('Request Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    this.authToken = null;
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Authentication endpoints
  async signup(email: string, password: string): Promise<AxiosResponse> {
    return this.client.post('/auth/signup', { email, password });
  }

  async login(email: string, password: string): Promise<AxiosResponse> {
    const response = await this.client.post('/auth/login', { email, password });
    if (response.data.access_token) {
      this.setAuthToken(response.data.access_token);
    }
    return response;
  }

  async getProfile(): Promise<AxiosResponse> {
    return this.client.get('/auth/profile');
  }

  // Client endpoints
  async createClient(clientData: TestClient): Promise<AxiosResponse> {
    return this.client.post('/clients', clientData);
  }

  async getAllClients(): Promise<AxiosResponse> {
    return this.client.get('/clients');
  }

  async getClientById(id: string): Promise<AxiosResponse> {
    return this.client.get(`/clients/${id}`);
  }

  async updateClient(id: string, updateData: Partial<TestClient>): Promise<AxiosResponse> {
    return this.client.patch(`/clients/${id}`, updateData);
  }

  async deleteClient(id: string): Promise<AxiosResponse> {
    return this.client.delete(`/clients/${id}`);
  }

  // Expense endpoints
  async createExpense(expenseData: any): Promise<AxiosResponse> {
    return this.client.post('/expenses', expenseData);
  }

  async getAllExpenses(): Promise<AxiosResponse> {
    return this.client.get('/expenses');
  }

  async getExpenseById(id: string): Promise<AxiosResponse> {
    return this.client.get(`/expenses/${id}`);
  }

  // Investment endpoints
  async createInvestment(investmentData: any): Promise<AxiosResponse> {
    return this.client.post('/investment', investmentData);
  }

  async getInvestmentPortfolio(clientId: string): Promise<AxiosResponse> {
    return this.client.get(`/investment/${clientId}`);
  }

  // Tax endpoints
  async calculateTax(taxData: any): Promise<AxiosResponse> {
    return this.client.post('/tax/calculate', taxData);
  }

  async getTaxHistory(): Promise<AxiosResponse> {
    return this.client.get('/tax/history');
  }

  async generateTaxReport(year: number): Promise<AxiosResponse> {
    return this.client.get(`/tax/report/${year}`, {
      responseType: 'arraybuffer',
    });
  }

  // AI endpoints
  async getAIRecommendations(data: any): Promise<AxiosResponse> {
    return this.client.post('/ai/recommendations', data);
  }

  async processFinancialData(data: any): Promise<AxiosResponse> {
    return this.client.post('/ai/process', data);
  }

  // Analytics endpoints
  async getFinancialSummary(): Promise<AxiosResponse> {
    return this.client.get('/analytics/financial-summary');
  }

  async getSalesAnalytics(): Promise<AxiosResponse> {
    return this.client.get('/analytics/sales-analytics');
  }

  // Learning endpoints
  async getLearningContent(): Promise<AxiosResponse> {
    return this.client.get('/learning');
  }

  async getPersonalizedContent(profile: any): Promise<AxiosResponse> {
    return this.client.post('/learning/personalized', profile);
  }

  // Quiz endpoints
  async getQuizzes(): Promise<AxiosResponse> {
    return this.client.get('/quiz');
  }

  async submitQuizAttempt(quizId: string, answers: any): Promise<AxiosResponse> {
    return this.client.post(`/quiz/${quizId}/attempt`, answers);
  }

  // Loan endpoints
  async applyForLoan(loanData: any): Promise<AxiosResponse> {
    return this.client.post('/loans', loanData);
  }

  async getLoanStatus(loanId: string): Promise<AxiosResponse> {
    return this.client.get(`/loans/${loanId}`);
  }

  // Insurance endpoints
  async createInsurance(insuranceData: any): Promise<AxiosResponse> {
    return this.client.post('/insurance', insuranceData);
  }

  async getInsurancePortfolio(clientId: string): Promise<AxiosResponse> {
    return this.client.get(`/insurance/${clientId}`);
  }

  // Cash flow endpoints
  async getCashFlowAnalysis(): Promise<AxiosResponse> {
    return this.client.get('/cash-flow/analysis');
  }

  async getCashFlowForecast(months: number): Promise<AxiosResponse> {
    return this.client.get(`/cash-flow/forecast/${months}`);
  }

  // Generic request method
  async request(method: string, endpoint: string, data?: any): Promise<AxiosResponse> {
    return this.client.request({
      method,
      url: endpoint,
      data,
    });
  }
}
