import type { Config } from 'jest'

const config: Config = {
  rootDir: '.',
  // Match unit and integration tests; specific projects below refine envs
  testMatch: [
    '<rootDir>/tests/unit/**/*.spec.ts',
    '<rootDir>/tests/integration/**/*.spec.ts',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // Transform TS/JS via swc for speed; supports ESM
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', {}],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  // Support TS path aliases "@/..."
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Coverage settings
  coverageProvider: 'v8',
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/lib/**/*.{ts,tsx}',
    '<rootDir>/src/app/api/**/*.ts',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/build/',
    '<rootDir>/prisma/migrations/',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 60,
      statements: 60,
    },
  },

  // Per-directory environments via projects
  projects: [
    {
      displayName: 'unit-jsdom',
      testMatch: ['<rootDir>/tests/unit/**/*.spec.ts'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
    },
    {
      displayName: 'integration-node',
      testMatch: ['<rootDir>/tests/integration/**/*.spec.ts'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.integration.setup.ts'],
    },
  ],
}

export default config
