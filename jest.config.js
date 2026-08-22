module.exports = {
  coverageDirectory: 'coverage',
  projects:[
    {
      displayName:'integration',
      testEnvironment: 'node',
      collectCoverageFrom: [
        '<rootDir>/src/controllers/*.js',
        '<rootDir>/src/middleware/*.js',
        '<rootDir>/src/services/*.js',
        '<rootDir>/src/repositories/*.js',
        '!src/server.js',
        '!tests/helpers/*'
      ],
      testMatch: ['**/tests/integration/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'] 
    },
    {
      displayName:'unit',
      testEnvironment: 'node',
      collectCoverageFrom: [
        'src/services/*'
      ],
      coveragePathIgnorePatterns:[
        '<rootDir>/src/config/*',
        '<rootDir>/src/constants/*',
        '<rootDir>/src/repositories/*',
        '<rootDir>/src/utils/*'        
      ],
      testMatch: ['**/tests/unit/*.test.js']
    }
  ]
};