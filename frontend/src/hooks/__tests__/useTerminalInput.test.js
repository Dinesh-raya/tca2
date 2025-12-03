/**
 * useTerminalInput Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useTerminalInput } from '../useTerminalInput';

describe('useTerminalInput Hook', () => {
  let mockXterm;
  let mockState;

  beforeEach(() => {
    mockXterm = {
      current: {
        write: jest.fn(),
        writeln: jest.fn(),
      },
    };

    mockState = {
      current: {
        loggedIn: true,
        username: 'testuser',
        currentRoom: 'general',
        token: 'mock-token',
      },
    };
  });

  describe('Input Buffer Management', () => {
    test('should initialize with empty input buffer', () => {
      const { result } = renderHook(() =>
        useTerminalInput(mockXterm, mockState, null, null, () => '> ', () => {})
      );

      expect(result.current.getInputBuffer()).toBe('');
    });

    test('should add characters to input buffer', () => {
      const { result } = renderHook(() =>
        useTerminalInput(mockXterm, mockState, null, null, () => '> ', () => {})
      );

      act(() => {
        result.current.handleCharacter('h');
        result.current.handleCharacter('i');
      });

      expect(result.current.getInputBuffer()).toBe('hi');
    });

    test('should clear input buffer', () => {
      const { result } = renderHook(() =>
        useTerminalInput(mockXterm, mockState, null, null, () => '> ', () => {})
      );

      act(() => {
        result.current.handleCharacter('t');
        result.current.handleCharacter('e');
        result.current.handleCharacter('s');
        result.current.handleCharacter('t');
      });

      expect(result.current.getInputBuffer()).toBe('test');

      act(() => {
        result.current.clearInputBuffer();
      });

      expect(result.current.getInputBuffer()).toBe('');
    });
  });

  describe('Keyboard Event Handling', () => {
    test('should handle character input', () => {
      const { result } = renderHook(() =>
        useTerminalInput(mockXterm, mockState, null, null, () => '> ', () => {})
      );

      act(() => {
        result.current.handleCharacter('a');
      });

      expect(result.current.getInputBuffer()).toBe('a');
      expect(mockXterm.current.write).toHaveBeenCalledWith('a');
    });

    test('should handle backspace', () => {
      const { result } = renderHook(() =>
        useTerminalInput(mockXterm, mockState, null, null, () => '> ', () => {})
      );

      act(() => {
        result.current.handleCharacter('h');
        result.current.handleCharacter('i');
        result.current.handleBackspace();
      });

      expect(result.current.getInputBuffer()).toBe('h');
      expect(mockXterm.current.write).toHaveBeenCalledWith('\b \b');
    });

    test('should not backspace on empty buffer', () => {
      const { result } = renderHook(() =>
        useTerminalInput(mockXterm, mockState, null, null, () => '> ', () => {})
      );

      act(() => {
        result.current.handleBackspace();
      });

      expect(result.current.getInputBuffer()).toBe('');
      expect(mockXterm.current.write).not.toHaveBeenCalledWith('\b \b');
    });

    test('should handle enter key', () => {
      const mockCallback = jest.fn();
      const { result } = renderHook(() =>
        useTerminalInput(mockXterm, mockState, null, mockCallback, () => '> ', () => {})
      );

      act(() => {
        result.current.handleCharacter('t');
        result.current.handleCharacter('e');
        result.current.handleCharacter('s');
        result.current.handleCharacter('t');
        result.current.handleEnter();
      });

      expect(mockCallback).toHaveBeenCalledWith('test');
      expect(result.current.getInputBuffer()).toBe('');
    });
  });

  describe('Edge Cases', () => {
    test('should handle rapid character input', () => {
      const { result } = renderHook(() =>
        useTerminalInput(mockXterm, mockState, null, null, () => '> ', () => {})
      );

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.handleCharacter(String(i % 10));
        }
      });

      const buffer = result.current.getInputBuffer();
      expect(buffer.length).toBe(100);
    });

    test('should handle special characters', () => {
      const { result } = renderHook(() =>
        useTerminalInput(mockXterm, mockState, null, null, () => '> ', () => {})
      );

      act(() => {
        result.current.handleCharacter('!');
        result.current.handleCharacter('@');
        result.current.handleCharacter('#');
      });

      expect(result.current.getInputBuffer()).toBe('!@#');
    });

    test('should handle spaces in input', () => {
      const { result } = renderHook(() =>
        useTerminalInput(mockXterm, mockState, null, null, () => '> ', () => {})
      );

      act(() => {
        result.current.handleCharacter('h');
        result.current.handleCharacter('e');
        result.current.handleCharacter('l');
        result.current.handleCharacter('l');
        result.current.handleCharacter('o');
        result.current.handleCharacter(' ');
        result.current.handleCharacter('w');
        result.current.handleCharacter('o');
        result.current.handleCharacter('r');
        result.current.handleCharacter('l');
        result.current.handleCharacter('d');
      });

      expect(result.current.getInputBuffer()).toBe('hello world');
    });
  });
});
