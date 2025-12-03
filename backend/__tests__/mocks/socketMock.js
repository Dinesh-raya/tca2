/**
 * Socket Mock for Backend Tests
 */

module.exports = {
  createMockSocket: (userId = 'mock-user-123', username = 'testuser') => ({
    id: `socket-${userId}`,
    userId,
    username,
    on: jest.fn(),
    emit: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
  }),

  createMockIO: () => {
    const socketsMap = new Map();
    
    return {
      on: jest.fn(),
      to: jest.fn(function(room) {
        return {
          emit: jest.fn(),
          send: jest.fn(),
        };
      }),
      emit: jest.fn(),
      sockets: {
        sockets: socketsMap,
        in: jest.fn(function(room) {
          return {
            emit: jest.fn(),
            send: jest.fn(),
          };
        }),
      },
    };
  },

  createMockRequest: (overrides = {}) => ({
    user: {
      userId: 'mock-user-id-123',
      username: 'testuser',
      isAdmin: false,
    },
    token: 'mock-token',
    headers: {
      authorization: 'Bearer mock-token',
    },
    ...overrides,
  }),

  createMockResponse: () => ({
    status: jest.fn(function() { return this; }),
    json: jest.fn(function() { return this; }),
    send: jest.fn(function() { return this; }),
    end: jest.fn(function() { return this; }),
    setHeader: jest.fn(function() { return this; }),
    statusCode: 200,
  }),
};
