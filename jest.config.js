module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.test.js',
    '<rootDir>/frontend/src/__tests__/**/*.test.tsx'
  ],
  collectCoverageFrom: [
    'server.js',
    'frontend/src/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/frontend/node_modules/'
  ],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  }
};
