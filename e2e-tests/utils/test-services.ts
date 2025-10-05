import { ApiClient } from '../utils/api-client';

export class AuthService {
  private apiClient: ApiClient;
  private currentUser: any = null;
  private authToken: string | null = null;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async authenticateAsUser(email?: string, password?: string): Promise<string> {
    const userEmail = email || 'testuser@finarva.com';
    const userPassword = password || 'Test123!@#';

    try {
      const response = await this.apiClient.login(userEmail, userPassword);
      this.authToken = response.data.access_token;
      this.currentUser = response.data.user;
      return this.authToken!;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 404) {
        // User doesn't exist, create them first
        await this.apiClient.signup(userEmail, userPassword);
        const loginResponse = await this.apiClient.login(userEmail, userPassword);
        this.authToken = loginResponse.data.access_token;
        this.currentUser = loginResponse.data.user;
        return this.authToken!;
      }
      throw error;
    }
  }

  async authenticateAsAdmin(): Promise<string> {
    return this.authenticateAsUser('admin@finarva.com', 'Admin123!@#');
  }

  getCurrentUser(): any {
    return this.currentUser;
  }

  getCurrentToken(): string | null {
    return this.authToken;
  }

  logout(): void {
    this.apiClient.clearAuthToken();
    this.authToken = null;
    this.currentUser = null;
  }

  isAuthenticated(): boolean {
    return this.authToken !== null;
  }
}

export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private config: Record<string, any> = {};

  private constructor() {
    this.loadConfiguration();
  }

  static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  private loadConfiguration(): void {
    // Default configuration
    this.config = {
      API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
      API_TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000'),
      TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/finarva_test',
      REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
      JWT_SECRET: process.env.JWT_SECRET || 'test-jwt-secret',
      PARALLEL_TESTS: process.env.PARALLEL_TESTS === 'true',
      DEBUG_MODE: process.env.DEBUG_MODE === 'true',
      CLEANUP_AFTER_TESTS: process.env.CLEANUP_AFTER_TESTS !== 'false',
      DEFAULT_TEST_TIMEOUT: parseInt(process.env.DEFAULT_TEST_TIMEOUT || '30000'),
    };
  }

  get<T = any>(key: string, defaultValue?: T): T {
    return this.config[key] ?? defaultValue;
  }

  set(key: string, value: any): void {
    this.config[key] = value;
  }

  getApiConfig() {
    return {
      baseURL: this.get('API_BASE_URL'),
      timeout: this.get('API_TIMEOUT'),
    };
  }

  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  isDebugMode(): boolean {
    return this.get('DEBUG_MODE', false);
  }
}

export class ResponseValidator {
  static validateAuthResponse(response: any): void {
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('access_token');
    expect(response.data).toHaveProperty('user');
    expect(response.data.user).toHaveProperty('id');
    expect(response.data.user).toHaveProperty('email');
  }

  static validateClientResponse(response: any): void {
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('name');
    expect(response.data).toHaveProperty('email');
    expect(response.data).toHaveProperty('createdAt');
  }

  static validateExpenseResponse(response: any): void {
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('amount');
    expect(response.data).toHaveProperty('category');
    expect(response.data).toHaveProperty('date');
  }

  static validateInvestmentResponse(response: any): void {
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('investmentType');
    expect(response.data).toHaveProperty('symbol');
    expect(response.data).toHaveProperty('quantity');
  }

  static validateTaxResponse(response: any): void {
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('taxOwed');
    expect(response.data).toHaveProperty('effectiveRate');
    expect(response.data).toHaveProperty('breakdown');
  }

  static validateAIResponse(response: any): void {
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('recommendations');
    expect(Array.isArray(response.data.recommendations)).toBe(true);
  }

  static validateErrorResponse(response: any, expectedStatus: number): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.data).toHaveProperty('message');
    expect(response.data).toHaveProperty('statusCode');
  }
}

export class WaitHelper {
  static async waitFor(
    condition: () => Promise<boolean>,
    timeoutMs = 30000,
    intervalMs = 1000
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        if (await condition()) {
          return true;
        }
      } catch (error) {
        // Ignore errors during condition checks
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    return false;
  }

  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        console.log(`Operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`);
        await this.sleep(delayMs);
      }
    }

    throw lastError;
  }
}

export class LoggingHelper {
  private static debugMode = EnvironmentManager.getInstance().isDebugMode();

  static debug(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  static info(message: string, data?: any): void {
    console.log(`[INFO] ${message}`, data || '');
  }

  static warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data || '');
  }

  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error || '');
  }

  static testStep(stepName: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[TEST STEP] ${stepName}`, data || '');
    }
  }
}
