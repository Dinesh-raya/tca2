/**
 * MongoDB/Mongoose Mock for Backend Tests
 */

module.exports = {
  createMockModel: (data = []) => {
    let mockData = [...data];
    
    return {
      find: jest.fn(function(query = {}) {
        return {
          exec: jest.fn().mockResolvedValue(mockData),
          limit: jest.fn(function() { return this; }),
          sort: jest.fn(function() { return this; }),
          populate: jest.fn(function() { return this; }),
        };
      }),
      findById: jest.fn(function(id) {
        return {
          exec: jest.fn().mockResolvedValue(mockData.find(item => item._id === id)),
          populate: jest.fn(function() { return this; }),
        };
      }),
      findOne: jest.fn(function(query) {
        return {
          exec: jest.fn().mockResolvedValue(mockData.find(item => Object.entries(query).every(([key, val]) => item[key] === val))),
          populate: jest.fn(function() { return this; }),
        };
      }),
      create: jest.fn(function(data) {
        const newItem = { _id: `id-${Date.now()}`, ...data };
        mockData.push(newItem);
        return Promise.resolve(newItem);
      }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      countDocuments: jest.fn().mockResolvedValue(mockData.length),
    };
  },

  createMockUser: (overrides = {}) => ({
    _id: 'mock-user-id-123',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    isAdmin: false,
    rooms: [],
    createdAt: new Date(),
    ...overrides,
  }),

  createMockRoom: (overrides = {}) => ({
    _id: 'mock-room-id-123',
    name: 'Test Room',
    description: 'A test room',
    users: ['mock-user-id-123'],
    createdAt: new Date(),
    ...overrides,
  }),

  createMockMessage: (overrides = {}) => ({
    _id: 'mock-message-id-123',
    sender: 'mock-user-id-123',
    senderName: 'testuser',
    content: 'Test message',
    room: 'mock-room-id-123',
    timestamp: new Date(),
    ...overrides,
  }),
};
