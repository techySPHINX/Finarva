// Jest global setup for E2E tests
// You can add custom matchers, global hooks, or environment setup here

beforeAll(() => {
  // Example: Set up global test environment variables or logging
  process.env.TZ = 'UTC';
});

afterAll(() => {
  // Example: Clean up global resources
});

// Add custom Jest matchers or setup here if needed
