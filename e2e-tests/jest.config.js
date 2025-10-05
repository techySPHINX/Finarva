export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/specs'],
  testMatch: ['**/*.e2e-spec.ts', '**/*.e2e-spec.js'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'specs/**/*.{ts,js}',
    '!specs/**/*.d.ts',
    '!specs/**/test-helpers.ts',
    '!specs/**/setup.ts',
    '!specs/**/fixtures/**',
    '!specs/**/utils/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/specs/utils/setup.ts'],
  testTimeout: 30000,
  maxWorkers: 1,
  verbose: true,
};
