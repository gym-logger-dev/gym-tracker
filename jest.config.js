/** @type {import('jest').Config} */
const alias = { '^@/(.*)$': '<rootDir>/src/$1' };

module.exports = {
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/packages/**/*.test.ts'],
      testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/__tests__/'],
      moduleNameMapper: alias,
    },
    {
      displayName: 'app',
      preset: 'jest-expo',
      testMatch: ['<rootDir>/src/__tests__/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
      moduleNameMapper: alias,
    },
  ],
};
