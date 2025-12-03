// backend/jest.config.js
module.exports = {
    testEnvironment: 'node',
    verbose: true,
    collectCoverageFrom: [
        'controllers/**/*.js',
        'services/**/*.js',
        'utils/**/*.js',
        'middleware/**/*.js',
        '!**/node_modules/**',
        '!**/vendor/**'
    ],
    coverageDirectory: 'coverage',
    testMatch: ['**/tests/**/*.test.js']
};
