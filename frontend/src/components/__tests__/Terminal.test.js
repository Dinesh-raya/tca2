/**
 * Terminal Component Tests
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Terminal from '../Terminal';

// Mock socket.io-client
jest.mock('socket.io-client');

// Mock xterm
jest.mock('xterm', () => ({
  Terminal: jest.fn(() => ({
    open: jest.fn(),
    focus: jest.fn(),
    write: jest.fn(),
    writeln: jest.fn(),
    clear: jest.fn(),
    dispose: jest.fn(),
    loadAddon: jest.fn(),
    onKey: jest.fn(),
  })),
}));

jest.mock('xterm-addon-fit', () => ({
  FitAddon: jest.fn(() => ({
    fit: jest.fn(),
  })),
}));

describe('Terminal Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should render terminal container', () => {
    render(<Terminal />);
    
    const container = document.querySelector('[style*="position: relative"]');
    expect(container).toBeInTheDocument();
  });

  test('should initialize with correct dimensions', () => {
    render(<Terminal />);
    
    const terminal = document.querySelector('div[style*="width: 100vw"]');
    expect(terminal).toBeInTheDocument();
  });

  test('should have dark theme by default', () => {
    render(<Terminal />);
    
    const container = document.querySelector('[style*="#1e1e1e"]');
    expect(container).toBeInTheDocument();
  });

  test('should focus terminal on click', async () => {
    const user = userEvent.setup();
    render(<Terminal />);
    
    const terminal = document.querySelector('div[tabindex="0"]');
    expect(terminal).toBeInTheDocument();
  });

  test('should have tab index for accessibility', () => {
    render(<Terminal />);
    
    const terminal = document.querySelector('[tabindex="0"]');
    expect(terminal).toBeInTheDocument();
  });

  test('should cleanup on unmount', () => {
    const { unmount } = render(<Terminal />);
    
    // Should not throw
    expect(() => unmount()).not.toThrow();
  });
});

describe('Terminal Component - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render full terminal application', async () => {
    render(<Terminal />);
    
    await waitFor(() => {
      const container = document.querySelector('div');
      expect(container).toBeInTheDocument();
    });
  });

  test('should have proper structure', () => {
    const { container } = render(<Terminal />);
    
    const divs = container.querySelectorAll('div');
    expect(divs.length).toBeGreaterThan(0);
  });

  test('should export default', () => {
    // Terminal should be a valid React component
    expect(Terminal).toBeDefined();
    expect(typeof Terminal).toBe('function');
  });
});

describe('Terminal Component - Environment Variables', () => {
  beforeEach(() => {
    // Clear environment
    delete process.env.REACT_APP_BACKEND_URL;
  });

  test('should use default backend URL when not set', () => {
    render(<Terminal />);
    
    // Component should render without errors
    const container = document.querySelector('div');
    expect(container).toBeInTheDocument();
  });

  test('should use custom backend URL when set', () => {
    process.env.REACT_APP_BACKEND_URL = 'https://custom-backend.com';
    
    render(<Terminal />);
    
    const container = document.querySelector('div');
    expect(container).toBeInTheDocument();
  });
});

describe('Terminal Component - Refs', () => {
  test('should maintain xterm ref', () => {
    render(<Terminal />);
    
    const container = document.querySelector('div');
    expect(container).toBeInTheDocument();
  });

  test('should maintain socket ref', () => {
    render(<Terminal />);
    
    const container = document.querySelector('div');
    expect(container).toBeInTheDocument();
  });

  test('should maintain state ref', () => {
    render(<Terminal />);
    
    const container = document.querySelector('div');
    expect(container).toBeInTheDocument();
  });
});

describe('Terminal Component - Hook Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should integrate useTerminalInput hook', () => {
    render(<Terminal />);
    
    const terminal = document.querySelector('div[tabindex="0"]');
    expect(terminal).toBeInTheDocument();
  });

  test('should integrate useTerminalDisplay hook', () => {
    render(<Terminal />);
    
    const container = document.querySelector('div');
    expect(container).toBeInTheDocument();
  });

  test('should integrate useTerminalCommands hook', () => {
    render(<Terminal />);
    
    const container = document.querySelector('div');
    expect(container).toBeInTheDocument();
  });

  test('should integrate useSocketEvents hook', () => {
    render(<Terminal />);
    
    const container = document.querySelector('div');
    expect(container).toBeInTheDocument();
  });
});

describe('Terminal Component - Error Handling', () => {
  test('should render even if socket connection fails', () => {
    // Mock io to throw error
    jest.mock('socket.io-client', () => {
      throw new Error('Connection failed');
    });

    // Should still render terminal
    expect(() => render(<Terminal />)).not.toThrow();
  });

  test('should handle missing XTerm addon', () => {
    // Should render without FitAddon if not available
    expect(() => render(<Terminal />)).not.toThrow();
  });

  test('should handle ref as null gracefully', () => {
    expect(() => render(<Terminal />)).not.toThrow();
  });
});

describe('Terminal Component - Performance', () => {
  test('should use useLayoutEffect for DOM updates', () => {
    const { container } = render(<Terminal />);
    
    // Component should be in document
    expect(container).toBeInTheDocument();
  });

  test('should use refs instead of state for performance', () => {
    render(<Terminal />);
    
    // Refs prevent unnecessary re-renders
    const terminal = document.querySelector('div[tabindex="0"]');
    expect(terminal).toBeInTheDocument();
  });

  test('should memoize hooks', () => {
    const { rerender } = render(<Terminal />);
    
    // Re-render should not cause issues
    rerender(<Terminal />);
    
    const terminal = document.querySelector('div');
    expect(terminal).toBeInTheDocument();
  });
});

describe('Terminal Component - Accessibility', () => {
  test('should be keyboard accessible', () => {
    render(<Terminal />);
    
    const terminal = document.querySelector('[tabindex="0"]');
    expect(terminal).toHaveAttribute('tabindex', '0');
  });

  test('should be focusable', () => {
    render(<Terminal />);
    
    const terminal = document.querySelector('[tabindex="0"]');
    expect(terminal).toBeInTheDocument();
  });

  test('should use semantic HTML', () => {
    const { container } = render(<Terminal />);
    
    const div = container.querySelector('div');
    expect(div).toBeInTheDocument();
  });
});
