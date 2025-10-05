import { ApiClient } from '../utils/api-client';
import { AuthService, EnvironmentManager } from '../utils/test-services';
import { TestDataFactory, DatabaseHelper, AssertionHelper } from '../utils/test-helpers';
import { validUserData, invalidUserData } from '../fixtures/test-data';
import { authEndpoints } from '../fixtures/endpoints';

describe('Authentication E2E Tests', () => {
  let apiClient: ApiClient;
  let authService: AuthService;
  let databaseHelper: DatabaseHelper;
  const envManager = EnvironmentManager.getInstance();
  const createdUsers: string[] = [];

  beforeAll(async () => {
    apiClient = new ApiClient(envManager.getApiConfig());
    authService = new AuthService(apiClient);
    databaseHelper = new DatabaseHelper(apiClient);

    // Wait for API to be ready
    const isReady = await databaseHelper.waitForDatabase();
    expect(isReady).toBe(true);
  }, 30000);

  afterAll(async () => {
    // Cleanup created test users
    if (envManager.get('CLEANUP_AFTER_TESTS', true)) {
      await databaseHelper.cleanupTestData({ users: createdUsers });
    }
  });

  describe('User Registration', () => {
    it('should successfully register a new user', async () => {
      const userData = TestDataFactory.createTestUser();

      const response = await apiClient.signup(userData.email, userData.password);

      AssertionHelper.assertCreatedResponse(response);
      expect(response.data.user).toHaveProperty('email', userData.email);
      expect(response.data.user).not.toHaveProperty('password');

      if (response.data.user.id) {
        createdUsers.push(response.data.user.id);
      }
    });

    it('should reject registration with invalid email', async () => {
      try {
        await apiClient.signup(invalidUserData.email, validUserData.password);
        fail('Should have thrown an error for invalid email');
      } catch (error: any) {
        AssertionHelper.assertValidationError(error.response, 'email');
      }
    });

    it('should reject registration with weak password', async () => {
      try {
        await apiClient.signup(validUserData.email, invalidUserData.password);
        fail('Should have thrown an error for weak password');
      } catch (error: any) {
        AssertionHelper.assertValidationError(error.response, 'password');
      }
    });

    it('should reject duplicate email registration', async () => {
      const userData = TestDataFactory.createTestUser();

      // First registration should succeed
      const firstResponse = await apiClient.signup(userData.email, userData.password);
      AssertionHelper.assertCreatedResponse(firstResponse);

      if (firstResponse.data.user.id) {
        createdUsers.push(firstResponse.data.user.id);
      }

      // Second registration with same email should fail
      try {
        await apiClient.signup(userData.email, userData.password);
        fail('Should have thrown an error for duplicate email');
      } catch (error: any) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.message).toContain('already exists');
      }
    });
  });

  describe('User Authentication', () => {
    let testUser: any;

    beforeAll(async () => {
      // Create a test user for authentication tests
      testUser = TestDataFactory.createTestUser();
      const response = await apiClient.signup(testUser.email, testUser.password);
      testUser.id = response.data.user.id;
      createdUsers.push(testUser.id);
    });

    afterEach(() => {
      authService.logout();
    });

    it('should successfully login with valid credentials', async () => {
      const response = await apiClient.login(testUser.email, testUser.password);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('access_token');
      expect(response.data).toHaveProperty('user');
      expect(response.data.user.email).toBe(testUser.email);
      expect(typeof response.data.access_token).toBe('string');
    });

    it('should reject login with invalid email', async () => {
      try {
        await apiClient.login('nonexistent@example.com', testUser.password);
        fail('Should have thrown an error for invalid email');
      } catch (error: any) {
        AssertionHelper.assertUnauthorized(error.response);
      }
    });

    it('should reject login with invalid password', async () => {
      try {
        await apiClient.login(testUser.email, 'wrongpassword');
        fail('Should have thrown an error for invalid password');
      } catch (error: any) {
        AssertionHelper.assertUnauthorized(error.response);
      }
    });

    it('should reject login with empty credentials', async () => {
      try {
        await apiClient.login('', '');
        fail('Should have thrown an error for empty credentials');
      } catch (error: any) {
        AssertionHelper.assertValidationError(error.response);
      }
    });
  });

  describe('Protected Routes Access', () => {
    let testUser: any;
    let authToken: string;

    beforeAll(async () => {
      testUser = TestDataFactory.createTestUser();
      const signupResponse = await apiClient.signup(testUser.email, testUser.password);
      testUser.id = signupResponse.data.user.id;
      createdUsers.push(testUser.id);

      authToken = await authService.authenticateAsUser(testUser.email, testUser.password);
    });

    afterAll(() => {
      authService.logout();
    });

    it('should access profile with valid token', async () => {
      const response = await apiClient.getProfile();

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('email', testUser.email);
      expect(response.data).not.toHaveProperty('password');
    });

    it('should reject profile access without token', async () => {
      apiClient.clearAuthToken();

      try {
        await apiClient.getProfile();
        fail('Should have thrown an error for missing token');
      } catch (error: any) {
        AssertionHelper.assertUnauthorized(error.response);
      }

      // Restore token
      apiClient.setAuthToken(authToken);
    });

    it('should reject profile access with invalid token', async () => {
      apiClient.setAuthToken('invalid.jwt.token');

      try {
        await apiClient.getProfile();
        fail('Should have thrown an error for invalid token');
      } catch (error: any) {
        AssertionHelper.assertUnauthorized(error.response);
      }

      // Restore valid token
      apiClient.setAuthToken(authToken);
    });

    it('should reject profile access with expired token', async () => {
      // This test would require a way to create expired tokens
      // For now, we'll simulate it with a malformed token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      apiClient.setAuthToken(expiredToken);

      try {
        await apiClient.getProfile();
        fail('Should have thrown an error for expired token');
      } catch (error: any) {
        AssertionHelper.assertUnauthorized(error.response);
      }

      // Restore valid token
      apiClient.setAuthToken(authToken);
    });
  });

  describe('Session Management', () => {
    let testUser: any;

    beforeAll(async () => {
      testUser = TestDataFactory.createTestUser();
      const response = await apiClient.signup(testUser.email, testUser.password);
      testUser.id = response.data.user.id;
      createdUsers.push(testUser.id);
    });

    it('should maintain session across multiple requests', async () => {
      // Login
      const loginResponse = await apiClient.login(testUser.email, testUser.password);
      AssertionHelper.assertSuccessResponse(loginResponse);

      // Make multiple authenticated requests
      const profile1 = await apiClient.getProfile();
      AssertionHelper.assertSuccessResponse(profile1);

      const profile2 = await apiClient.getProfile();
      AssertionHelper.assertSuccessResponse(profile2);

      expect(profile1.data.id).toBe(profile2.data.id);
    });

    it('should handle concurrent authentication requests', async () => {
      const concurrentLogins = Array(5).fill(null).map(() =>
        apiClient.login(testUser.email, testUser.password)
      );

      const responses = await Promise.all(concurrentLogins);

      responses.forEach(response => {
        AssertionHelper.assertSuccessResponse(response);
        expect(response.data).toHaveProperty('access_token');
      });
    });
  });

  describe('Password Security', () => {
    it('should enforce strong password requirements', async () => {
      const weakPasswords = [
        '123456',
        'password',
        'abc123',
        '12345678',
        'qwerty',
        '',
        'a',
        '1234567890abcdef', // too common pattern
      ];

      for (const weakPassword of weakPasswords) {
        try {
          await apiClient.signup(TestDataFactory.createRandomEmail(), weakPassword);
          fail(`Should have rejected weak password: ${weakPassword}`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      }
    });

    it('should accept strong passwords', async () => {
      const strongPasswords = [
        'Test123!@#',
        'MyStr0ngP@ssw0rd!',
        'C0mpl3x&S3cur3!',
        'P@ssw0rd123!',
      ];

      for (const strongPassword of strongPasswords) {
        const userData = TestDataFactory.createTestUser({ password: strongPassword });
        const response = await apiClient.signup(userData.email, strongPassword);

        AssertionHelper.assertCreatedResponse(response);
        if (response.data.user.id) {
          createdUsers.push(response.data.user.id);
        }
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should handle multiple rapid login attempts', async () => {
      const userData = TestDataFactory.createTestUser();
      await apiClient.signup(userData.email, userData.password);

      // Make rapid login attempts
      const rapidAttempts = Array(10).fill(null).map(() =>
        apiClient.login(userData.email, userData.password)
      );

      const responses = await Promise.allSettled(rapidAttempts);

      // At least some should succeed (rate limiting may kick in)
      const successful = responses.filter(r => r.status === 'fulfilled').length;
      expect(successful).toBeGreaterThan(0);
    });

    it('should handle failed login attempts gracefully', async () => {
      const userData = TestDataFactory.createTestUser();
      await apiClient.signup(userData.email, userData.password);

      // Make multiple failed attempts
      const failedAttempts = Array(5).fill(null).map(() =>
        apiClient.login(userData.email, 'wrongpassword').catch(e => e)
      );

      const results = await Promise.all(failedAttempts);

      results.forEach(result => {
        expect(result.response?.status).toBe(401);
      });
    });
  });
});
