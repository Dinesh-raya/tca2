/**
 * useTerminalDisplay Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useTerminalDisplay } from '../useTerminalDisplay';

describe('useTerminalDisplay Hook', () => {
  let mockXterm;
  let mockState;

  beforeEach(() => {
    mockXterm = {
      current: {
        write: jest.fn(),
        writeln: jest.fn(),
        clear: jest.fn(),
      },
    };

    mockState = {
      current: {
        loggedIn: false,
        username: '',
        currentRoom: '',
        inDM: false,
        dmUser: '',
      },
    };
  });

  describe('Prompt Generation', () => {
    test('should return login prompt when not logged in', () => {
      const { result } = renderHook(() =>
        useTerminalDisplay(mockXterm, mockState)
      );

      const prompt = result.current.getPrompt();
      expect(prompt).toContain('login');
    });

    test('should return room prompt when in room', () => {
      mockState.current.loggedIn = true;
      mockState.current.username = 'testuser';
      mockState.current.currentRoom = 'general';

      const { result } = renderHook(() =>
        useTerminalDisplay(mockXterm, mockState)
      );

      const prompt = result.current.getPrompt();
      expect(prompt).toContain('general');
      expect(prompt).toContain('testuser');
    });

    test('should return DM prompt when in DM', () => {
      mockState.current.loggedIn = true;
      mockState.current.username = 'testuser';
      mockState.current.inDM = true;
      mockState.current.dmUser = 'otheruser';

      const { result } = renderHook(() =>
        useTerminalDisplay(mockXterm, mockState)
      );

      const prompt = result.current.getPrompt();
      expect(prompt).toContain('otheruser');
      expect(prompt).toContain('DM');
    });
  });

  describe('Output Writing', () => {
    test('should write normal output', () => {
      const { result } = renderHook(() =>
        useTerminalDisplay(mockXterm, mockState)
      );

      act(() => {
        result.current.writeOutput('Test message');
      });

      expect(mockXterm.current.writeln).toHaveBeenCalled();
    });

    test('should write error messages', () => {
      const { result } = renderHook(() =>
        useTerminalDisplay(mockXterm, mockState)
      );

      act(() => {
        result.current.writeError('Error occurred');
      });

      expect(mockXterm.current.writeln).toHaveBeenCalled();
    });

    test('should write success messages', () => {
      const { result } = renderHook(() =>
        useTerminalDisplay(mockXterm, mockState)
      );

      act(() => {
        result.current.writeSuccess('Operation successful');
      });

      expect(mockXterm.current.writeln).toHaveBeenCalled();
    });

    test('should write prompt', () => {
      const { result } = renderHook(() =>
        useTerminalDisplay(mockXterm, mockState)
      );

      act(() => {
        result.current.writePrompt();
      });

      expect(mockXterm.current.write).toHaveBeenCalled();
    });
  });

  describe('Display Methods', () => {
    test('should display help text', () => {
      const { result } = renderHook(() =>
        useTerminalDisplay(mockXterm, mockState)
      );

      act(() => {
        result.current.displayHelp();
      });

      expect(mockXterm.current.writeln).toHaveBeenCalled();
    });

    test('should display room message', () => {
      const { result } = renderHook(() =>
        useTerminalDisplay(mockXterm, mockState)
      );

      const message = {
        senderName: 'user1',
        content: 'Hello room',
        timestamp: new Date(),
      };

      act(() => {
        result.current.displayRoomMessage(message);
      });

      expect(mockXterm.current.writeln).toHaveBeenCalled();
    });

    test('should display DM message', () => {
      const { result } = renderHook(() =>
        useTerminalDisplay(mockXterm, mockState)
      );

      const message = {
        senderName: 'user1',
        content: 'Hello DM',
        timestamp: new Date(),
      };

      act(() => {
        result.current.displayDM(message);
      });

      expect(mockXterm.current.writeln).toHaveBeenCalled();
    });

    test('should display user list', () => {
      const { result } = renderHook(() =>
        useTerminalDisplay(mockXterm, mockState)
      );

      const users = ['user1', 'user2', 'user3'];

      act(() => {
        result.current.displayUserList(users);
      });

      expect(mockXterm.current.writeln).toHaveBeenCalled();
    });

    test('should display room history', () => {
      const { result } = renderHook(() =>
        useTerminalDisplay(mockXterm, mockState)
      );

      const history = [
        { senderName: 'user1', content: 'Message 1', timestamp: new Date() },
        { senderName: 'user2', content: 'Message 2', timestamp: new Date() },
      ];

      act(() => {
        result.current.displayRoomHistory(history);
      });

      expect(mockXterm.current.writeln).toHaveBeenCalled();
    });

    test('should display DM history', () => {
      const { result } = renderHook(() =>
        useTerminalDisplay(mockXterm, mockState)
      );

      const history = [
        { senderName: 'user1', content: 'DM 1', timestamp: new Date() },
        { senderName: 'user2', content: 'DM 2', timestamp: new Date() },
      ];

      act(() => {
        result.current.displayDMHistory(history);
      });

      expect(mockXterm.current.writeln).toHaveBeenCalled();
    });
  });

  describe('Line Operations', () => {
    test('should clear current line', () => {
      const { result } = renderHook(() =>
        useTerminalDisplay(mockXterm, mockState)
      );

      act(() => {
        result.current.clearLine();
      });

      expect(mockXterm.current.write).toHaveBeenCalled();
    });
  });

  describe('Sanitization', () => {
    test('should sanitize messages with XSS attempts', () => {
      const { result } = renderHook(() =>
        useTerminalDisplay(mockXterm, mockState)
      );

      const message = {
        senderName: 'user1',
        content: '<script>alert("XSS")</script>Hello',
        timestamp: new Date(),
      };

      act(() => {
        result.current.displayRoomMessage(message);
      });

      // Verify output doesn't contain script tags
      const calls = mockXterm.current.writeln.mock.calls;
      const output = calls.join(' ');
      expect(output).not.toContain('<script>');
    });

    test('should escape HTML entities', () => {
      const { result } = renderHook(() =>
        useTerminalDisplay(mockXterm, mockState)
      );

      const message = {
        senderName: 'user1',
        content: 'Test & <div>content</div>',
        timestamp: new Date(),
      };

      act(() => {
        result.current.displayRoomMessage(message);
      });

      expect(mockXterm.current.writeln).toHaveBeenCalled();
    });
  });
});
