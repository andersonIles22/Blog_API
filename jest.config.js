module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '<rootDir>/src/controllers/*.js',
    '<rootDir>/src/middleware/*.js',
    '!src/server.js',
    '!tests/helpers/*'
  ],
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'] 
};