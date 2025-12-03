/**
 * Socket Authentication Tests
 * Test Suite: 6 authentication functions
 */

const jwtMock = require('./mocks/jwtMock');
jest.mock('jsonwebtoken', () => jwtMock);

const {
  validateSocketUser,
  extractToken,
  isValidToken,
  checkRoomAccess,
  createAuthToken,
  refreshAuthToken,
} = require('../../middleware/socketAuth');

describe('Socket Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateSocketUser', () => {
    test('should validate socket with valid token', () => {
      const socket = {
        handshake: {
          auth: {
            token: 'valid-token',
          },
        },
      };
      const result = validateSocketUser(socket);
      expect(result).toBeTruthy();
    });

    test('should reject socket without token', () => {
      const socket = {
        handshake: {
          auth: {},
        },
      };
      const result = validateSocketUser(socket);
      expect(result).toBeFalsy();
    });

    test('should reject socket with invalid token', () => {
      const socket = {
        handshake: {
          auth: {
            token: 'invalid-token',
          },
        },
      };
      expect(() => validateSocketUser(socket)).toThrow();
    });

    test('should extract user info from valid token', () => {
      const socket = {
        handshake: {
          auth: {
            token: 'valid-token',
          },
        },
      };
      const result = validateSocketUser(socket);
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('username');
    });
  });

  describe('extractToken', () => {
    test('should extract token from auth header', () => {
      const auth = { token: 'my-token' };
      const result = extractToken(auth);
      expect(result).toBe('my-token');
    });

    test('should return null for missing token', () => {
      const auth = {};
      const result = extractToken(auth);
      expect(result).toBeNull();
    });

    test('should handle Bearer prefix', () => {
      const auth = { token: 'Bearer my-token' };
      const result = extractToken(auth);
      expect(result).toBeTruthy();
    });

    test('should handle null auth', () => {
      const result = extractToken(null);
      expect(result).toBeNull();
    });
  });

  describe('isValidToken', () => {
    test('should return true for valid token', () => {
      const result = isValidToken('valid-token');
      expect(result).toBe(true);
    });

    test('should return false for invalid token', () => {
      const result = isValidToken('invalid-token');
      expect(result).toBe(false);
    });

    test('should return false for empty token', () => {
      const result = isValidToken('');
      expect(result).toBe(false);
    });

    test('should return false for null token', () => {
      const result = isValidToken(null);
      expect(result).toBe(false);
    });
  });

  describe('checkRoomAccess', () => {
    test('should grant access if user is in room', async () => {
      const user = {
        userId: 'user-123',
        rooms: ['room-123'],
      };
      const result = await checkRoomAccess(user, 'room-123');
      expect(result).toBe(true);
    });

    test('should deny access if user not in room', async () => {
      const user = {
        userId: 'user-123',
        rooms: ['room-456'],
      };
      const result = await checkRoomAccess(user, 'room-123');
      expect(result).toBe(false);
    });

    test('should grant access if user is admin', async () => {
      const user = {
        userId: 'user-123',
        isAdmin: true,
        rooms: [],
      };
      const result = await checkRoomAccess(user, 'room-123');
      expect(result).toBe(true);
    });

    test('should handle multiple room access', async () => {
      const user = {
        userId: 'user-123',
        rooms: ['room-1', 'room-2', 'room-3'],
      };
      const result = await checkRoomAccess(user, 'room-2');
      expect(result).toBe(true);
    });
  });

  describe('createAuthToken', () => {
    test('should create token with user data', () => {
      const userData = {
        userId: 'user-123',
        username: 'testuser',
        isAdmin: false,
      };
      const token = createAuthToken(userData);
      expect(token).toBeTruthy();
      expect(token).toContain('mock-token');
    });

    test('should include all required fields', () => {
      const userData = {
        userId: 'user-123',
        username: 'testuser',
        isAdmin: true,
      };
      const token = createAuthToken(userData);
      expect(token).toBeTruthy();
    });

    test('should handle missing fields', () => {
      const userData = {
        userId: 'user-123',
      };
      const token = createAuthToken(userData);
      expect(token).toBeTruthy();
    });
  });

  describe('refreshAuthToken', () => {
    test('should refresh valid token', () => {
      const oldToken = 'valid-token';
      const newToken = refreshAuthToken(oldToken);
      expect(newToken).toBeTruthy();
      expect(newToken).not.toBe(oldToken);
    });

    test('should fail for invalid token', () => {
      const oldToken = 'invalid-token';
      expect(() => refreshAuthToken(oldToken)).toThrow();
    });

    test('should maintain user data in new token', () => {
      const oldToken = 'valid-token';
      const newToken = refreshAuthToken(oldToken);
      expect(newToken).toBeTruthy();
    });
  });
});
