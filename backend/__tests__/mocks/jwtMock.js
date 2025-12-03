/**
 * JWT Mock for Backend Tests
 */

const jwt = jest.requireActual('jsonwebtoken');

module.exports = {
  ...jwt,
  sign: jest.fn((payload, secret, options) => {
    // Return a mock token
    return `mock-token-${Date.now()}`;
  }),
  verify: jest.fn((token, secret) => {
    if (token === 'invalid-token') {
      throw new Error('Invalid token');
    }
    return {
      userId: 'mock-user-id-123',
      username: 'testuser',
      isAdmin: false,
      iat: Math.floor(Date.now() / 1000),
    };
  }),
  decode: jest.fn((token) => {
    return {
      userId: 'mock-user-id-123',
      username: 'testuser',
      isAdmin: false,
    };
  }),
};
