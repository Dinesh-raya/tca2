/**
 * Socket.io Mock for Frontend Tests
 */

export const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn(),
  connect: jest.fn(),
  connected: true,
  id: 'mock-socket-id-123',
};

export const mockIO = jest.fn(() => mockSocket);

export default mockIO;
