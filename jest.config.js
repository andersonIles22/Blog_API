module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '<rootDir>/src/controllers/*.js',
    '<rootDir>/src/middleware/*.js',
    '<rootDir>/src/services/*.js',
    '<rootDir>/src/repositories/*.js',
    '!src/server.js',
    '!tests/helpers/*'
    
  ],
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'] 
};