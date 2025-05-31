export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testTimeout: 10000,
  maxWorkers: 1,
  maxConcurrency: 1,
  maxWorkers: 1,
  workerIdleMemoryLimit: '200Mb',
  testEnvironmentOptions: {
    maxWorkers: 1,
    maxConcurrency: 1,
    maxWorkers: 1,
    workerIdleMemoryLimit: '200Mb',
  },
};
