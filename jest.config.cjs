module.exports = {
  preset: 'jest-expo',
  cacheDirectory: '<rootDir>/.cache/jest',
  testMatch: ['**/tests/**/*.ui.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: ['src/**/*.{js,cjs}', '!src/theme/**', '!src/utils/performance.cjs'],
};
