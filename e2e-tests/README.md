# E2E Test Execution Guide

This document provides comprehensive instructions for running the Finarva E2E test suite.

## Prerequisites

Before running the tests, ensure you have:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn** package manager
3. **Finarva API server** running locally or accessible remotely
4. **MongoDB** database accessible
5. **Redis** (if using caching features)

## Installation

1. Navigate to the e2e-tests directory:

```bash
cd e2e-tests
```

2. Install dependencies:

```bash
npm install
```

## Environment Configuration

Create a `.env` file in the e2e-tests directory with the following variables:

```env
# API Configuration
API_BASE_URL=http://localhost:3000
API_TIMEOUT=30000

# Database Configuration
TEST_DATABASE_URL=mongodb://localhost:27017/finarva_test
REDIS_URL=redis://localhost:6379

# Test Configuration
PARALLEL_TESTS=false
DEBUG_MODE=false
CLEANUP_AFTER_TESTS=true
DEFAULT_TEST_TIMEOUT=30000

# Authentication
JWT_SECRET=your-test-jwt-secret
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

#### Authentication Tests

```bash
npm run test:auth
```

#### Client Management Tests

```bash
npm run test:clients
```

#### Financial Services Tests

```bash
npm run test:financial
```

#### AI & Analytics Tests

```bash
npm run test:ai-analytics
```

#### Learning & Business Tests

```bash
npm run test:learning
```

#### Performance Tests

```bash
npm run test:performance
```

#### Security Tests

```bash
npm run test:security
```

### Run Tests with Specific Options

#### Watch Mode (for development)

```bash
npm run test:watch
```

#### Debug Mode

```bash
npm run test:debug
```

#### Verbose Output

```bash
npm run test:verbose
```

#### Run Tests in Parallel

```bash
npm run test:parallel
```

#### Generate Coverage Report

```bash
npm run test:coverage
```

## Test Structure

The E2E test suite is organized into the following categories:

### 1. Authentication Tests (`auth.e2e-spec.ts`)

- User registration and validation
- Login/logout functionality
- Protected route access
- Session management
- Password security
- Rate limiting

### 2. Client Management Tests (`clients.e2e-spec.ts`)

- Client CRUD operations
- Data validation
- Search and filtering
- Bulk operations
- Data export

### 3. Financial Services Tests (`financial-services.e2e-spec.ts`)

- Expense management
- Investment tracking
- Tax calculations
- Loan processing
- Insurance management
- Cash flow analysis

### 4. AI & Analytics Tests (`ai-analytics.e2e-spec.ts`)

- AI recommendations
- Financial analytics
- Data processing
- Real-time analytics
- Custom reports
- Model performance

### 5. Learning & Business Tests (`learning-business.e2e-spec.ts`)

- Learning content management
- Quiz system
- Inventory management
- Merchant assistant
- Reporting system
- System health monitoring

### 6. Performance Tests (`performance.e2e-spec.ts`)

- API response times
- Concurrent request handling
- Bulk operations
- Memory and resource usage
- Database performance
- Scalability testing

### 7. Security Tests (`security.e2e-spec.ts`)

- Authentication security
- Input validation
- Rate limiting
- Error handling
- Data privacy
- Session security

## Test Utilities and Helpers

### API Client (`utils/api-client.ts`)

Provides a comprehensive client for making API requests with built-in error handling and authentication management.

### Test Helpers (`utils/test-helpers.ts`)

- **TestDataFactory**: Creates test data with realistic values
- **DatabaseHelper**: Handles test data cleanup and database operations
- **AssertionHelper**: Common assertion patterns for API responses

### Test Services (`utils/test-services.ts`)

- **AuthService**: Manages authentication for tests
- **EnvironmentManager**: Handles environment configuration
- **ResponseValidator**: Validates API response structures
- **WaitHelper**: Utility functions for timing and retries
- **LoggingHelper**: Test logging and debugging

## Test Data and Fixtures

### Test Data (`fixtures/test-data.ts`)

Contains sample data for all entity types:

- User data (valid/invalid)
- Client profiles
- Financial transactions
- Learning content
- Quiz data
- Performance test data

### API Endpoints (`fixtures/endpoints.ts`)

Centralized endpoint definitions for all API routes, organized by module.

## Configuration Options

### Environment Variables

| Variable               | Description                          | Default                 |
| ---------------------- | ------------------------------------ | ----------------------- |
| `API_BASE_URL`         | Base URL for the API server          | `http://localhost:3000` |
| `API_TIMEOUT`          | Request timeout in milliseconds      | `30000`                 |
| `PARALLEL_TESTS`       | Run tests in parallel                | `false`                 |
| `DEBUG_MODE`           | Enable debug logging                 | `false`                 |
| `CLEANUP_AFTER_TESTS`  | Clean up test data after completion  | `true`                  |
| `DEFAULT_TEST_TIMEOUT` | Default timeout for individual tests | `30000`                 |

### Jest Configuration

The test suite uses Jest with the following key configurations:

- TypeScript support with ts-jest
- Custom test environment setup
- Comprehensive coverage reporting
- Parallel execution support

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Use proper setup and teardown
- Clean up created test data

### 2. Data Management

- Use the TestDataFactory for consistent test data
- Avoid hardcoded values
- Use realistic data that matches production patterns

### 3. Error Handling

- Test both success and failure scenarios
- Verify proper error responses
- Check error message content

### 4. Performance Testing

- Set reasonable timeout expectations
- Monitor resource usage
- Test under various load conditions

### 5. Security Testing

- Test authentication and authorization
- Validate input sanitization
- Check for information disclosure

## Troubleshooting

### Common Issues

#### 1. Connection Timeouts

- Verify API server is running
- Check network connectivity
- Increase timeout values if needed

#### 2. Authentication Failures

- Verify JWT secret configuration
- Check user creation process
- Ensure proper token handling

#### 3. Database Connection Issues

- Verify MongoDB is running and accessible
- Check database URL configuration
- Ensure test database exists

#### 4. Test Data Conflicts

- Enable test data cleanup
- Use unique identifiers
- Check for existing test data

### Debug Mode

Enable debug mode to see detailed test execution:

```bash
DEBUG_MODE=true npm test
```

This will show:

- API request/response details
- Test step execution
- Data creation and cleanup operations
- Performance metrics

### Selective Test Execution

Run specific tests using Jest patterns:

```bash
# Run only authentication tests
npm test -- --testNamePattern="Authentication"

# Run tests for a specific file
npm test -- auth.e2e-spec.ts

# Run tests matching a pattern
npm test -- --testNamePattern="should create"
```

## Continuous Integration

For CI/CD pipelines, use:

```bash
# Run tests with coverage and CI-friendly output
npm run test:ci
```

This command:

- Runs all tests once (no watch mode)
- Generates coverage reports
- Uses CI-friendly output format
- Fails fast on errors

## Reporting

### Coverage Reports

Coverage reports are generated in the `coverage/` directory and include:

- HTML reports for browser viewing
- lcov format for CI tools
- Text summary in console

### Test Results

Test results include:

- Pass/fail status for each test
- Execution time for performance monitoring
- Error details for failed tests
- Coverage metrics

## Contributing

When adding new tests:

1. Follow the existing file structure
2. Use consistent naming conventions
3. Include both positive and negative test cases
4. Add appropriate documentation
5. Ensure tests are deterministic and repeatable

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review test logs in debug mode
3. Verify environment configuration
4. Check API server status and logs
