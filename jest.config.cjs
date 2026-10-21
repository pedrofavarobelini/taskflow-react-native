module.exports = {
  preset: 'jest-expo',
  cacheDirectory: '<rootDir>/.cache/jest',
  // A primeira transformação do React Native pode exceder 5 s com cache frio no Windows.
  testTimeout: 20000,
  testMatch: ['**/tests/**/*.ui.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: ['src/**/*.{js,cjs}', '!src/theme/**', '!src/utils/performance.cjs'],
};
