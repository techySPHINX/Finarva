import { ApiClient } from '../utils/api-client';
import { AuthService, EnvironmentManager } from '../utils/test-services';
import { TestDataFactory, DatabaseHelper, AssertionHelper } from '../utils/test-helpers';
import { validClientData, invalidClientData } from '../fixtures/test-data';
import { clientEndpoints } from '../fixtures/endpoints';

describe('Client Management E2E Tests', () => {
  let apiClient: ApiClient;
  let authService: AuthService;
  let databaseHelper: DatabaseHelper;
  const envManager = EnvironmentManager.getInstance();
  const createdData = {
    users: [] as string[],
    clients: [] as string[],
  };

  beforeAll(async () => {
    apiClient = new ApiClient(envManager.getApiConfig());
    authService = new AuthService(apiClient);
    databaseHelper = new DatabaseHelper(apiClient);

    // Wait for API to be ready
    const isReady = await databaseHelper.waitForDatabase();
    expect(isReady).toBe(true);

    // Authenticate as a test user
    await authService.authenticateAsUser();
  }, 30000);

  afterAll(async () => {
    if (envManager.get('CLEANUP_AFTER_TESTS', true)) {
      await databaseHelper.cleanupTestData(createdData);
    }
    authService.logout();
  });

  describe('Client Creation', () => {
    it('should successfully create a new client', async () => {
      const clientData = TestDataFactory.createTestClient();

      const response = await apiClient.createClient(clientData);

      AssertionHelper.assertCreatedResponse(response);
      expect(response.data.name).toBe(clientData.name);
      expect(response.data.email).toBe(clientData.email);
      expect(response.data.phone).toBe(clientData.phone);
      expect(response.data.incomeLevel).toBe(clientData.incomeLevel);
      expect(response.data.riskTolerance).toBe(clientData.riskTolerance);

      createdData.clients.push(response.data.id);
    });

    it('should create client with minimal required data', async () => {
      const minimalClientData = {
        name: 'Minimal Client',
        email: TestDataFactory.createRandomEmail(),
      };

      const response = await apiClient.createClient(minimalClientData);

      AssertionHelper.assertCreatedResponse(response);
      expect(response.data.name).toBe(minimalClientData.name);
      expect(response.data.email).toBe(minimalClientData.email);

      createdData.clients.push(response.data.id);
    });

    it('should reject client creation with invalid email', async () => {
      const clientData = {
        ...validClientData,
        email: invalidClientData.email,
      };

      try {
        await apiClient.createClient(clientData);
        fail('Should have thrown an error for invalid email');
      } catch (error: any) {
        AssertionHelper.assertValidationError(error.response, 'email');
      }
    });

    it('should reject client creation with empty name', async () => {
      const clientData = {
        ...validClientData,
        name: '',
      };

      try {
        await apiClient.createClient(clientData);
        fail('Should have thrown an error for empty name');
      } catch (error: any) {
        AssertionHelper.assertValidationError(error.response, 'name');
      }
    });

    it('should reject client creation with duplicate email', async () => {
      const clientData = TestDataFactory.createTestClient();

      // Create first client
      const firstResponse = await apiClient.createClient(clientData);
      AssertionHelper.assertCreatedResponse(firstResponse);
      createdData.clients.push(firstResponse.data.id);

      // Try to create second client with same email
      try {
        await apiClient.createClient(clientData);
        fail('Should have thrown an error for duplicate email');
      } catch (error: any) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.message).toContain('already exists');
      }
    });
  });

  describe('Client Retrieval', () => {
    let testClient: any;

    beforeAll(async () => {
      const clientData = TestDataFactory.createTestClient();
      const response = await apiClient.createClient(clientData);
      testClient = response.data;
      createdData.clients.push(testClient.id);
    });

    it('should retrieve all clients', async () => {
      const response = await apiClient.getAllClients();

      AssertionHelper.assertArrayResponse(response, 1);
      expect(response.data.some((client: any) => client.id === testClient.id)).toBe(true);
    });

    it('should retrieve client by valid ID', async () => {
      const response = await apiClient.getClientById(testClient.id);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data.id).toBe(testClient.id);
      expect(response.data.name).toBe(testClient.name);
      expect(response.data.email).toBe(testClient.email);
    });

    it('should return 404 for non-existent client ID', async () => {
      try {
        await apiClient.getClientById('64f7a8b8e1234567890abcde');
        fail('Should have thrown an error for non-existent client');
      } catch (error: any) {
        AssertionHelper.assertNotFound(error.response);
      }
    });

    it('should return 400 for invalid client ID format', async () => {
      try {
        await apiClient.getClientById('invalid-id');
        fail('Should have thrown an error for invalid ID format');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Client Updates', () => {
    let testClient: any;

    beforeAll(async () => {
      const clientData = TestDataFactory.createTestClient();
      const response = await apiClient.createClient(clientData);
      testClient = response.data;
      createdData.clients.push(testClient.id);
    });

    it('should successfully update client information', async () => {
      const updateData = {
        name: 'Updated Client Name',
        phone: '+1987654321',
        occupation: 'Senior Developer',
        incomeLevel: 'HIGH' as const,
      };

      const response = await apiClient.updateClient(testClient.id, updateData);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data.name).toBe(updateData.name);
      expect(response.data.phone).toBe(updateData.phone);
      expect(response.data.occupation).toBe(updateData.occupation);
      expect(response.data.incomeLevel).toBe(updateData.incomeLevel);
      expect(response.data.email).toBe(testClient.email); // Should remain unchanged
    });

    it('should partially update client information', async () => {
      const updateData = {
        riskTolerance: 'AGGRESSIVE' as const,
      };

      const response = await apiClient.updateClient(testClient.id, updateData);

      AssertionHelper.assertSuccessResponse(response);
      expect(response.data.riskTolerance).toBe(updateData.riskTolerance);
      expect(response.data.name).toBeDefined(); // Other fields should remain
    });

    it('should reject update with invalid email', async () => {
      const updateData = {
        email: 'invalid-email-format',
      };

      try {
        await apiClient.updateClient(testClient.id, updateData);
        fail('Should have thrown an error for invalid email');
      } catch (error: any) {
        AssertionHelper.assertValidationError(error.response, 'email');
      }
    });

    it('should reject update for non-existent client', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      try {
        await apiClient.updateClient('64f7a8b8e1234567890abcde', updateData);
        fail('Should have thrown an error for non-existent client');
      } catch (error: any) {
        AssertionHelper.assertNotFound(error.response);
      }
    });
  });

  describe('Client Deletion', () => {
    it('should successfully delete a client', async () => {
      const clientData = TestDataFactory.createTestClient();
      const createResponse = await apiClient.createClient(clientData);
      const clientId = createResponse.data.id;

      const deleteResponse = await apiClient.deleteClient(clientId);
      AssertionHelper.assertSuccessResponse(deleteResponse);

      // Verify client is deleted
      try {
        await apiClient.getClientById(clientId);
        fail('Should have thrown an error for deleted client');
      } catch (error: any) {
        AssertionHelper.assertNotFound(error.response);
      }
    });

    it('should return 404 when deleting non-existent client', async () => {
      try {
        await apiClient.deleteClient('64f7a8b8e1234567890abcde');
        fail('Should have thrown an error for non-existent client');
      } catch (error: any) {
        AssertionHelper.assertNotFound(error.response);
      }
    });

    it('should return 400 for invalid client ID format', async () => {
      try {
        await apiClient.deleteClient('invalid-id');
        fail('Should have thrown an error for invalid ID format');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Client Search and Filtering', () => {
    beforeAll(async () => {
      // Create multiple test clients with different attributes
      const clientsData = [
        TestDataFactory.createTestClient({
          name: 'Alice Johnson',
          occupation: 'Software Engineer',
          incomeLevel: 'HIGH',
          riskTolerance: 'MODERATE',
        }),
        TestDataFactory.createTestClient({
          name: 'Bob Smith',
          occupation: 'Teacher',
          incomeLevel: 'MEDIUM',
          riskTolerance: 'CONSERVATIVE',
        }),
        TestDataFactory.createTestClient({
          name: 'Charlie Brown',
          occupation: 'Doctor',
          incomeLevel: 'HIGH',
          riskTolerance: 'AGGRESSIVE',
        }),
      ];

      for (const clientData of clientsData) {
        const response = await apiClient.createClient(clientData);
        createdData.clients.push(response.data.id);
      }
    });

    it('should retrieve all clients without filters', async () => {
      const response = await apiClient.getAllClients();

      AssertionHelper.assertArrayResponse(response, 3);
      expect(response.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter clients by income level', async () => {
      const response = await apiClient.request('GET', '/clients?incomeLevel=HIGH');

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((client: any) => {
        expect(client.incomeLevel).toBe('HIGH');
      });
    });

    it('should filter clients by risk tolerance', async () => {
      const response = await apiClient.request('GET', '/clients?riskTolerance=CONSERVATIVE');

      AssertionHelper.assertArrayResponse(response);
      response.data.forEach((client: any) => {
        expect(client.riskTolerance).toBe('CONSERVATIVE');
      });
    });

    it('should search clients by name', async () => {
      const response = await apiClient.request('GET', '/clients?search=Alice');

      AssertionHelper.assertArrayResponse(response);
      expect(response.data.some((client: any) => client.name.includes('Alice'))).toBe(true);
    });
  });

  describe('Client Data Validation', () => {
    it('should validate income level enum values', async () => {
      const clientData = {
        ...validClientData,
        incomeLevel: 'INVALID_LEVEL' as any,
      };

      try {
        await apiClient.createClient(clientData);
        fail('Should have thrown an error for invalid income level');
      } catch (error: any) {
        AssertionHelper.assertValidationError(error.response, 'incomeLevel');
      }
    });

    it('should validate risk tolerance enum values', async () => {
      const clientData = {
        ...validClientData,
        riskTolerance: 'INVALID_TOLERANCE' as any,
      };

      try {
        await apiClient.createClient(clientData);
        fail('Should have thrown an error for invalid risk tolerance');
      } catch (error: any) {
        AssertionHelper.assertValidationError(error.response, 'riskTolerance');
      }
    });

    it('should validate phone number format', async () => {
      const clientData = {
        ...validClientData,
        phone: 'invalid-phone-123',
      };

      try {
        await apiClient.createClient(clientData);
        fail('Should have thrown an error for invalid phone format');
      } catch (error: any) {
        AssertionHelper.assertValidationError(error.response, 'phone');
      }
    });

    it('should accept valid phone number formats', async () => {
      const validPhoneFormats = [
        '+1234567890',
        '+1-234-567-8900',
        '+1 (234) 567-8900',
        '1234567890',
      ];

      for (const phone of validPhoneFormats) {
        const clientData = TestDataFactory.createTestClient({ phone });
        const response = await apiClient.createClient(clientData);

        AssertionHelper.assertCreatedResponse(response);
        createdData.clients.push(response.data.id);
      }
    });
  });

  describe('Client Bulk Operations', () => {
    it('should handle bulk client creation', async () => {
      const bulkClients = Array.from({ length: 10 }, () => TestDataFactory.createTestClient());

      const createPromises = bulkClients.map(clientData =>
        apiClient.createClient(clientData)
      );

      const responses = await Promise.all(createPromises);

      responses.forEach(response => {
        AssertionHelper.assertCreatedResponse(response);
        createdData.clients.push(response.data.id);
      });
    });

    it('should handle concurrent client operations', async () => {
      const clientData = TestDataFactory.createTestClient();
      const createResponse = await apiClient.createClient(clientData);
      const clientId = createResponse.data.id;
      createdData.clients.push(clientId);

      // Perform concurrent read operations
      const concurrentReads = Array(5).fill(null).map(() =>
        apiClient.getClientById(clientId)
      );

      const responses = await Promise.all(concurrentReads);

      responses.forEach(response => {
        AssertionHelper.assertSuccessResponse(response);
        expect(response.data.id).toBe(clientId);
      });
    });
  });

  describe('Client Data Export', () => {
    beforeAll(async () => {
      // Ensure we have some clients for export
      if (createdData.clients.length === 0) {
        const clientData = TestDataFactory.createTestClient();
        const response = await apiClient.createClient(clientData);
        createdData.clients.push(response.data.id);
      }
    });

    it('should export client data in CSV format', async () => {
      const response = await apiClient.request('GET', '/clients/export?format=csv', null);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.data).toContain('name,email'); // CSV headers
    });

    it('should export client data in JSON format', async () => {
      const response = await apiClient.request('GET', '/clients/export?format=json', null);

      AssertionHelper.assertArrayResponse(response);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });
});
