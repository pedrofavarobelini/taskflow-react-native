module.exports = {
  preset: 'jest-expo',
  cacheDirectory: '<rootDir>/.cache/jest',
  // A primeira transformação do React Native pode exceder 5 s com cache frio no Windows.
  testTimeout: 20000,
  testMatch: ['<rootDir>/tests/**/*.ui.test.js'],
  modulePathIgnorePatterns: ['<rootDir>/.clean-install/', '<rootDir>/.public-install/'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: ['src/**/*.{js,cjs}', '!src/theme/**', '!src/utils/performance.cjs'],
};
