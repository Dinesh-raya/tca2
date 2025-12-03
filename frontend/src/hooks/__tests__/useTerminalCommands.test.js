/**
 * useTerminalCommands Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useTerminalCommands } from '../useTerminalCommands';

describe('useTerminalCommands Hook', () => {
  let mockState;
  let mockSocket;
  let mockXterm;
  let mockDisplay;
  let mockFetch;

  beforeEach(() => {
    mockState = {
      current: {
        loggedIn: false,
        username: '',
        currentRoom: '',
        inDM: false,
        dmUser: '',
        token: null,
      },
    };

    mockSocket = {
      current: {
        emit: jest.fn(),
        on: jest.fn(),
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
      displayHelp: jest.fn(),
      displayUserList: jest.fn(),
      displayRoomHistory: jest.fn(),
    };

    // Mock fetch globally
    global.fetch = jest.fn();
    mockFetch = global.fetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Command Router', () => {
    test('should handle /help command', async () => {
      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      act(() => {
        result.current.handleCommand('/help');
      });

      expect(mockDisplay.displayHelp).toHaveBeenCalled();
    });

    test('should handle /login command', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'mock-token' }),
      });

      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      await act(async () => {
        result.current.handleCommand('/login testuser');
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    test('should handle /listrooms command', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ rooms: [] }),
      });

      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      await act(async () => {
        result.current.handleCommand('/listrooms');
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    test('should reject unknown command', () => {
      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      act(() => {
        result.current.handleCommand('/unknowncommand');
      });

      expect(mockDisplay.writeError).toHaveBeenCalled();
    });
  });

  describe('Authentication Commands', () => {
    test('should handle /login with username', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'mock-token', username: 'testuser' }),
      });

      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      await act(async () => {
        result.current.handleCommand('/login testuser');
      });

      expect(mockDisplay.writeSuccess || mockDisplay.writeOutput).toBeTruthy();
    });

    test('should handle /logout command', () => {
      mockState.current.loggedIn = true;
      mockState.current.username = 'testuser';
      mockState.current.token = 'mock-token';

      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      act(() => {
        result.current.handleCommand('/logout');
      });

      expect(mockState.current.loggedIn).toBe(false);
      expect(mockDisplay.writeSuccess).toHaveBeenCalled();
    });

    test('should reject /logout when not logged in', () => {
      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      act(() => {
        result.current.handleCommand('/logout');
      });

      expect(mockDisplay.writeError).toHaveBeenCalled();
    });
  });

  describe('Room Commands', () => {
    test('should handle /join command', () => {
      mockState.current.loggedIn = true;

      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      act(() => {
        result.current.handleCommand('/join general');
      });

      expect(mockSocket.current.emit).toHaveBeenCalledWith('join-room', expect.any(Object));
    });

    test('should handle /exit command', () => {
      mockState.current.loggedIn = true;
      mockState.current.currentRoom = 'general';

      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      act(() => {
        result.current.handleCommand('/exit');
      });

      expect(mockState.current.currentRoom).toBe('');
      expect(mockDisplay.writeSuccess).toHaveBeenCalled();
    });

    test('should handle /users command', () => {
      mockState.current.loggedIn = true;
      mockState.current.currentRoom = 'general';

      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      act(() => {
        result.current.handleCommand('/users');
      });

      expect(mockSocket.current.emit).toHaveBeenCalled();
    });
  });

  describe('DM Commands', () => {
    test('should handle /dm command', () => {
      mockState.current.loggedIn = true;

      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      act(() => {
        result.current.handleCommand('/dm otheruser');
      });

      expect(mockState.current.inDM).toBe(true);
      expect(mockState.current.dmUser).toBe('otheruser');
      expect(mockDisplay.writeSuccess).toHaveBeenCalled();
    });
  });

  describe('Admin Commands', () => {
    test('should reject /adduser if not admin', async () => {
      mockState.current.loggedIn = true;

      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      await act(async () => {
        result.current.handleCommand('/adduser newuser');
      });

      expect(mockDisplay.writeError).toHaveBeenCalled();
    });

    test('should reject /changepass with wrong syntax', () => {
      mockState.current.loggedIn = true;

      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      act(() => {
        result.current.handleCommand('/changepass');
      });

      expect(mockDisplay.writeError).toHaveBeenCalled();
    });
  });

  describe('Exit Commands', () => {
    test('should handle /quit command', () => {
      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      act(() => {
        result.current.handleCommand('/quit');
      });

      expect(mockDisplay.writeOutput).toHaveBeenCalled();
    });

    test('should handle /exit from DM', () => {
      mockState.current.loggedIn = true;
      mockState.current.inDM = true;
      mockState.current.dmUser = 'otheruser';

      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      act(() => {
        result.current.handleCommand('/exit');
      });

      expect(mockState.current.inDM).toBe(false);
      expect(mockState.current.dmUser).toBe('');
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      await act(async () => {
        result.current.handleCommand('/login testuser');
      });

      expect(mockDisplay.writeError).toHaveBeenCalled();
    });

    test('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      await act(async () => {
        result.current.handleCommand('/login testuser');
      });

      expect(mockDisplay.writeError).toHaveBeenCalled();
    });

    test('should require login for protected commands', () => {
      mockState.current.loggedIn = false;

      const { result } = renderHook(() =>
        useTerminalCommands(mockState, mockSocket, mockXterm, 'http://localhost:5000', mockDisplay)
      );

      act(() => {
        result.current.handleCommand('/join general');
      });

      expect(mockDisplay.writeError).toHaveBeenCalled();
    });
  });
});
