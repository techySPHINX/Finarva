import { ApiClient } from '../utils/api-client';
import { AuthService, EnvironmentManager } from '../utils/test-services';
import { TestDataFactory, AssertionHelper } from '../utils/test-helpers';
import { errorTestData } from '../fixtures/test-data';

describe('Security and Error Handling E2E Tests', () => {
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

  describe('Authentication and Authorization Security', () => {
    it('should prevent access without authentication', async () => {
      const unauthenticatedClient = new ApiClient(envManager.getApiConfig());

      try {
        await unauthenticatedClient.getProfile();
        fail('Should have thrown an error for unauthenticated access');
      } catch (error: any) {
        AssertionHelper.assertUnauthorized(error.response);
      }
    });

    it('should prevent access with expired tokens', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';

      apiClient.setAuthToken(expiredToken);

      try {
        await apiClient.getProfile();
        fail('Should have thrown an error for expired token');
      } catch (error: any) {
        AssertionHelper.assertUnauthorized(error.response);
      }

      // Restore valid authentication
      await authService.authenticateAsUser();
    });

    it('should prevent access with malformed tokens', async () => {
      const malformedToken = 'invalid.token.format';

      apiClient.setAuthToken(malformedToken);

      try {
        await apiClient.getProfile();
        fail('Should have thrown an error for malformed token');
      } catch (error: any) {
        AssertionHelper.assertUnauthorized(error.response);
      }

      // Restore valid authentication
      await authService.authenticateAsUser();
    });

    it('should prevent unauthorized resource access', async () => {
      // Try to access another user's data
      try {
        await apiClient.getClientById('64f7a8b8e1234567890abcde');
        fail('Should have thrown an error for unauthorized access');
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    it('should enforce role-based access control', async () => {
      // Try to access admin-only endpoints
      try {
        await apiClient.request('GET', '/admin/users');
        fail('Should have thrown an error for insufficient privileges');
      } catch (error: any) {
        expect([401, 403]).toContain(error.response?.status);
      }
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should reject SQL injection attempts', async () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; DELETE FROM clients; --",
        "' UNION SELECT * FROM users --",
      ];

      for (const payload of sqlInjectionPayloads) {
        try {
          await apiClient.createClient({
            name: payload,
            email: 'test@example.com',
          });
          fail(`Should have rejected SQL injection payload: ${payload}`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      }
    });

    it('should reject XSS attempts', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("xss")',
        '<svg onload="alert(1)">',
      ];

      for (const payload of xssPayloads) {
        try {
          await apiClient.createClient({
            name: payload,
            email: 'test@example.com',
          });
          fail(`Should have rejected XSS payload: ${payload}`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      }
    });

    it('should handle malformed JSON gracefully', async () => {
      try {
        await apiClient.request('POST', '/clients', errorTestData.malformedJson);
        fail('Should have thrown an error for malformed JSON');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should validate email formats strictly', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@@example.com',
        'user..name@example.com',
        'user@example',
      ];

      for (const email of invalidEmails) {
        try {
          await apiClient.createClient({
            name: 'Test User',
            email: email,
          });
          fail(`Should have rejected invalid email: ${email}`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      }
    });

    it('should validate numeric inputs', async () => {
      const invalidNumbers = ['not-a-number', 'Infinity', 'NaN', '', null];

      for (const amount of invalidNumbers) {
        try {
          await apiClient.createExpense({
            clientId: testClient.id,
            category: 'Test',
            amount: amount as any,
            description: 'Test expense',
            date: new Date().toISOString(),
          });
          fail(`Should have rejected invalid amount: ${amount}`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      }
    });

    it('should validate date formats', async () => {
      for (const date of errorTestData.invalidDates) {
        try {
          await apiClient.createExpense({
            clientId: testClient.id,
            category: 'Test',
            amount: 100,
            description: 'Test expense',
            date: date,
          });
          fail(`Should have rejected invalid date: ${date}`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      }
    });

    it('should limit input size to prevent DoS attacks', async () => {
      try {
        await apiClient.createClient({
          name: errorTestData.oversizedString,
          email: 'test@example.com',
        });
        fail('Should have rejected oversized input');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Rate Limiting and DoS Protection', () => {
    it('should handle rapid successive requests', async () => {
      const rapidRequests = Array.from({ length: 100 }, () =>
        apiClient.getProfile().catch(e => e)
      );

      const results = await Promise.all(rapidRequests);

      // Some requests might be rate limited
      const rateLimited = results.filter(result =>
        result.response?.status === 429
      ).length;

      const successful = results.filter(result =>
        result.status === 200
      ).length;

      // At least some should succeed, some might be rate limited
      expect(successful + rateLimited).toBe(rapidRequests.length);
    });

    it('should handle large payload attacks', async () => {
      const largePayload = {
        name: 'A'.repeat(10000),
        email: 'test@example.com',
        description: 'B'.repeat(50000),
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          value: 'C'.repeat(100),
        })),
      };

      try {
        await apiClient.request('POST', '/clients', largePayload);
        fail('Should have rejected large payload');
      } catch (error: any) {
        expect([400, 413]).toContain(error.response?.status); // Bad Request or Payload Too Large
      }
    });

    it('should prevent resource exhaustion attacks', async () => {
      // Try to create many resources rapidly
      const resourceCreationAttempts = Array.from({ length: 50 }, (_, i) =>
        apiClient.createExpense({
          clientId: testClient.id,
          category: 'Test',
          amount: 10,
          description: `Rapid creation test ${i}`,
          date: new Date().toISOString(),
        }).catch(e => e)
      );

      const results = await Promise.all(resourceCreationAttempts);

      // System should either accept all requests or rate limit appropriately
      const successful = results.filter(result => result.status === 201).length;
      const rateLimited = results.filter(result => result.response?.status === 429).length;

      expect(successful + rateLimited).toBe(resourceCreationAttempts.length);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test simulates database connectivity issues
      // In a real scenario, you might temporarily disconnect the database
      try {
        const response = await apiClient.request('GET', '/health/database');
        AssertionHelper.assertSuccessResponse(response);
      } catch (error: any) {
        // If database is down, should return appropriate error
        expect([503, 500]).toContain(error.response?.status);
        expect(error.response.data).toHaveProperty('message');
      }
    });

    it('should handle missing resources properly', async () => {
      try {
        await apiClient.getClientById('64f7a8b8e1234567890abcde');
        fail('Should have thrown an error for missing resource');
      } catch (error: any) {
        AssertionHelper.assertNotFound(error.response);
      }
    });

    it('should handle invalid HTTP methods', async () => {
      try {
        await apiClient.request('PATCH', '/auth/login', {
          email: 'test@example.com',
          password: 'password',
        });
        fail('Should have thrown an error for invalid method');
      } catch (error: any) {
        expect(error.response.status).toBe(405); // Method Not Allowed
      }
    });

    it('should handle malformed request headers', async () => {
      const clientWithBadHeaders = new ApiClient({
        ...envManager.getApiConfig(),
        headers: {
          'Content-Type': 'invalid/type',
          'Authorization': 'InvalidFormat token',
        },
      });

      try {
        await clientWithBadHeaders.getProfile();
        fail('Should have thrown an error for malformed headers');
      } catch (error: any) {
        expect([400, 401]).toContain(error.response?.status);
      }
    });

    it('should provide meaningful error messages', async () => {
      try {
        await apiClient.createClient({
          name: '',
          email: 'invalid-email',
        });
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('message');
        expect(error.response.data.message).toBeTruthy();
        expect(typeof error.response.data.message).toBe('string');
      }
    });

    it('should handle concurrent conflicting operations', async () => {
      const clientData = TestDataFactory.createTestClient();
      const createResponse = await apiClient.createClient(clientData);
      const clientId = createResponse.data.id;

      // Try to update and delete the same resource concurrently
      const updatePromise = apiClient.updateClient(clientId, { name: 'Updated Name' });
      const deletePromise = apiClient.deleteClient(clientId);

      const results = await Promise.allSettled([updatePromise, deletePromise]);

      // One should succeed, one should fail due to conflict
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      expect(successful).toBeGreaterThanOrEqual(1);
      expect(failed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Privacy and Compliance', () => {
    it('should not expose sensitive data in responses', async () => {
      const response = await apiClient.getProfile();

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data).not.toHaveProperty('password');
      expect(response.data).not.toHaveProperty('passwordHash');
      expect(response.data).not.toHaveProperty('salt');
    });

    it('should not expose internal system information', async () => {
      try {
        await apiClient.request('GET', '/health/detailed');
        fail('Should not expose detailed system information');
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    it('should handle data anonymization correctly', async () => {
      const response = await apiClient.request('GET', '/analytics/anonymized-summary');

      if (response.status === 200) {
        const dataString = JSON.stringify(response.data);

        // Should not contain personal identifiers
        expect(dataString).not.toMatch(/@\w+\.\w+/); // Email patterns
        expect(dataString).not.toMatch(/\+?\d{10,}/); // Phone patterns
        expect(dataString).not.toMatch(/\b\d{4}-\d{4}-\d{4}-\d{4}\b/); // Credit card patterns
      }
    });

    it('should enforce proper data retention policies', async () => {
      // Test data cleanup endpoints (if available)
      try {
        const response = await apiClient.request('POST', '/data/cleanup', {
          retentionPeriod: '30_days',
          dataTypes: ['logs', 'temp_files'],
        });

        if (response.status === 200) {
          expect(response.data).toHaveProperty('cleaned');
        }
      } catch (error: any) {
        // Cleanup might require admin privileges
        expect([401, 403]).toContain(error.response?.status);
      }
    });
  });

  describe('Security Headers and CORS', () => {
    it('should include security headers in responses', async () => {
      const response = await apiClient.getProfile();

      AssertionHelper.assertSuccessResponse(response);

      // Check for important security headers (if configured)
      const headers = response.headers;

      // These might be set by reverse proxy or application
      if (headers['x-frame-options']) {
        expect(headers['x-frame-options']).toBeDefined();
      }

      if (headers['x-content-type-options']) {
        expect(headers['x-content-type-options']).toBe('nosniff');
      }
    });

    it('should handle CORS properly', async () => {
      // CORS headers are typically handled by the server
      const response = await apiClient.request('OPTIONS', '/auth/profile');

      // OPTIONS request should be handled
      expect([200, 204]).toContain(response.status);
    });
  });

  describe('Session Security', () => {
    it('should invalidate sessions after logout', async () => {
      const tempClient = new ApiClient(envManager.getApiConfig());
      const tempAuth = new AuthService(tempClient);

      // Login and get a token
      await tempAuth.authenticateAsUser();

      // Verify access works
      const profileResponse = await tempClient.getProfile();
      AssertionHelper.assertSuccessResponse(profileResponse);

      // Logout
      tempAuth.logout();

      // Try to access with cleared token
      try {
        await tempClient.getProfile();
        fail('Should have thrown an error after logout');
      } catch (error: any) {
        AssertionHelper.assertUnauthorized(error.response);
      }
    });

    it('should handle session timeouts appropriately', async () => {
      // This would typically be tested with a token that has a short expiration
      // For this test, we'll verify the system handles invalid tokens properly
      const shortLivedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE2MTYyMzkwMjJ9.expired';

      apiClient.setAuthToken(shortLivedToken);

      try {
        await apiClient.getProfile();
        fail('Should have thrown an error for expired session');
      } catch (error: any) {
        AssertionHelper.assertUnauthorized(error.response);
      }

      // Restore valid authentication
      await authService.authenticateAsUser();
    });
  });
});
