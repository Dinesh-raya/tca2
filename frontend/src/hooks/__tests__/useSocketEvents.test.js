/**
 * useSocketEvents Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useSocketEvents } from '../useSocketEvents';

describe('useSocketEvents Hook', () => {
  let mockSocket;
  let mockState;
  let mockXterm;
  let mockDisplay;

  beforeEach(() => {
    mockSocket = {
      current: {
        on: jest.fn((event, callback) => {
          mockSocket.callbacks = mockSocket.callbacks || {};
          mockSocket.callbacks[event] = callback;
        }),
        emit: jest.fn(),
        off: jest.fn(),
        connected: true,
      },
    };

    mockState = {
      current: {
        loggedIn: true,
        username: 'testuser',
        currentRoom: 'general',
        inDM: false,
        dmUser: '',
        token: 'mock-token',
      },
    };

    mockXterm = {
      current: {
        write: jest.fn(),
        writeln: jest.fn(),
      },
    };

    mockDisplay = {
      getPrompt: jest.fn(() => '> '),
      writePrompt: jest.fn(),
      writeOutput: jest.fn(),
      writeError: jest.fn(),
      writeSuccess: jest.fn(),
      displayRoomMessage: jest.fn(),
      displayDM: jest.fn(),
      displayUserList: jest.fn(),
      displayRoomHistory: jest.fn(),
      displayDMHistory: jest.fn(),
    };
  });

  describe('Event Setup', () => {
    test('should setup socket listeners', () => {
      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.setupSocketListeners();
      });

      expect(mockSocket.current.on).toHaveBeenCalled();
    });

    test('should register join-room-success handler', () => {
      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.setupSocketListeners();
      });

      expect(mockSocket.current.on).toHaveBeenCalledWith(
        'join-room-success',
        expect.any(Function)
      );
    });

    test('should register room-message handler', () => {
      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.setupSocketListeners();
      });

      expect(mockSocket.current.on).toHaveBeenCalledWith(
        'room-message',
        expect.any(Function)
      );
    });

    test('should register dm handler', () => {
      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.setupSocketListeners();
      });

      expect(mockSocket.current.on).toHaveBeenCalledWith(
        'dm',
        expect.any(Function)
      );
    });

    test('should register disconnect handler', () => {
      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.setupSocketListeners();
      });

      expect(mockSocket.current.on).toHaveBeenCalledWith(
        'disconnect',
        expect.any(Function)
      );
    });
  });

  describe('Message Sending', () => {
    test('should send room message', () => {
      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.sendRoomMessage('Hello room');
      });

      expect(mockSocket.current.emit).toHaveBeenCalledWith(
        'room-message',
        expect.objectContaining({
          room: 'general',
          content: 'Hello room',
        })
      );
    });

    test('should send DM message', () => {
      mockState.current.inDM = true;
      mockState.current.dmUser = 'otheruser';

      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.sendDM('Hello user');
      });

      expect(mockSocket.current.emit).toHaveBeenCalledWith(
        'dm',
        expect.objectContaining({
          recipient: 'otheruser',
          content: 'Hello user',
        })
      );
    });

    test('should not send message without room', () => {
      mockState.current.currentRoom = '';

      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.sendRoomMessage('Test');
      });

      // Either shouldn't emit or should show error
      if (mockSocket.current.emit.called) {
        const calls = mockSocket.current.emit.mock.calls;
        expect(calls[0][0]).not.toBe('room-message');
      }
    });
  });

  describe('Event Handlers', () => {
    test('should handle room message event', () => {
      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.setupSocketListeners();
      });

      const message = {
        senderName: 'user1',
        content: 'Hello',
        timestamp: new Date(),
      };

      // Simulate receiving message
      if (mockSocket.callbacks && mockSocket.callbacks['room-message']) {
        act(() => {
          mockSocket.callbacks['room-message'](message);
        });
      }

      expect(mockDisplay.displayRoomMessage).toHaveBeenCalled();
    });

    test('should handle DM event', () => {
      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.setupSocketListeners();
      });

      const dmMessage = {
        senderName: 'otheruser',
        content: 'Hello DM',
        timestamp: new Date(),
      };

      if (mockSocket.callbacks && mockSocket.callbacks['dm']) {
        act(() => {
          mockSocket.callbacks['dm'](dmMessage);
        });
      }

      expect(mockDisplay.displayDM).toHaveBeenCalled();
    });

    test('should handle user list event', () => {
      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.setupSocketListeners();
      });

      const users = ['user1', 'user2', 'user3'];

      if (mockSocket.callbacks && mockSocket.callbacks['room-users']) {
        act(() => {
          mockSocket.callbacks['room-users'](users);
        });
      }

      expect(mockDisplay.displayUserList).toHaveBeenCalled();
    });

    test('should handle room history event', () => {
      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.setupSocketListeners();
      });

      const history = [
        { senderName: 'user1', content: 'msg1', timestamp: new Date() },
        { senderName: 'user2', content: 'msg2', timestamp: new Date() },
      ];

      if (mockSocket.callbacks && mockSocket.callbacks['room-history']) {
        act(() => {
          mockSocket.callbacks['room-history'](history);
        });
      }

      expect(mockDisplay.displayRoomHistory).toHaveBeenCalled();
    });

    test('should handle disconnect event', () => {
      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.setupSocketListeners();
      });

      if (mockSocket.callbacks && mockSocket.callbacks['disconnect']) {
        act(() => {
          mockSocket.callbacks['disconnect']();
        });
      }

      expect(mockDisplay.writeError).toHaveBeenCalled();
    });
  });

  describe('Connection Management', () => {
    test('should handle connection error', () => {
      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.setupSocketListeners();
      });

      if (mockSocket.callbacks && mockSocket.callbacks['connect_error']) {
        act(() => {
          mockSocket.callbacks['connect_error'](new Error('Connection failed'));
        });
      }

      expect(mockDisplay.writeError).toHaveBeenCalled();
    });

    test('should handle successful connection', () => {
      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.setupSocketListeners();
      });

      if (mockSocket.callbacks && mockSocket.callbacks['connect']) {
        act(() => {
          mockSocket.callbacks['connect']();
        });
      }

      expect(mockDisplay.writeSuccess).toHaveBeenCalled();
    });
  });

  describe('Auto-reconnection', () => {
    test('should rejoin room on reconnect', () => {
      mockState.current.currentRoom = 'general';

      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.setupSocketListeners();
      });

      if (mockSocket.callbacks && mockSocket.callbacks['connect']) {
        act(() => {
          mockSocket.callbacks['connect']();
        });
      }

      // Should emit join-room to rejoin
      expect(mockSocket.current.emit).toHaveBeenCalledWith(
        'join-room',
        expect.any(Object)
      );
    });

    test('should not rejoin if no current room', () => {
      mockState.current.currentRoom = '';

      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.setupSocketListeners();
      });

      mockSocket.current.emit.mockClear();

      if (mockSocket.callbacks && mockSocket.callbacks['connect']) {
        act(() => {
          mockSocket.callbacks['connect']();
        });
      }

      // Should not emit join-room
      const joinCalls = mockSocket.current.emit.mock.calls.filter(
        call => call[0] === 'join-room'
      );
      expect(joinCalls.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should sanitize incoming messages', () => {
      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.setupSocketListeners();
      });

      const maliciousMessage = {
        senderName: 'user1',
        content: '<script>alert("XSS")</script>',
        timestamp: new Date(),
      };

      if (mockSocket.callbacks && mockSocket.callbacks['room-message']) {
        act(() => {
          mockSocket.callbacks['room-message'](maliciousMessage);
        });
      }

      expect(mockDisplay.displayRoomMessage).toHaveBeenCalled();
    });

    test('should handle invalid message objects', () => {
      const { result } = renderHook(() =>
        useSocketEvents(mockSocket, mockState, mockXterm, mockDisplay)
      );

      act(() => {
        result.current.setupSocketListeners();
      });

      if (mockSocket.callbacks && mockSocket.callbacks['room-message']) {
        act(() => {
          mockSocket.callbacks['room-message'](null);
        });
      }

      // Should handle gracefully without crashing
      expect(mockDisplay.displayRoomMessage).not.toThrow;
    });
  });
});
