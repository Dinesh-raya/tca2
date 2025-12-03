/**
 * Sanitization Utils Tests
 * Test Suite: 5 sanitizers
 */

const {
  sanitizeInput,
  sanitizeMessage,
  sanitizeUsername,
  preventXSS,
  escapeHtml,
} = require('../../utils/sanitize');

describe('Sanitization Utils', () => {
  describe('sanitizeInput', () => {
    test('should remove script tags', () => {
      const input = 'Hello <script>alert("XSS")</script> world';
      const result = sanitizeInput(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    test('should remove event handlers', () => {
      const input = '<img src="x" onerror="alert(\'XSS\')">';
      const result = sanitizeInput(input);
      expect(result).not.toContain('onerror');
    });

    test('should trim whitespace', () => {
      const input = '   hello   ';
      const result = sanitizeInput(input);
      expect(result).toBe('hello');
    });

    test('should handle normal text', () => {
      const input = 'This is normal text';
      const result = sanitizeInput(input);
      expect(result).toBe('This is normal text');
    });

    test('should handle empty string', () => {
      const result = sanitizeInput('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeMessage', () => {
    test('should remove HTML tags from message', () => {
      const message = 'Hello <b>world</b>';
      const result = sanitizeMessage(message);
      expect(result).not.toContain('<b>');
      expect(result).not.toContain('</b>');
    });

    test('should remove script injections', () => {
      const message = 'Check this <script>malicious()</script>';
      const result = sanitizeMessage(message);
      expect(result).not.toContain('script');
    });

    test('should preserve emojis', () => {
      const message = 'Hello 😀 world';
      const result = sanitizeMessage(message);
      expect(result).toContain('😀');
    });

    test('should preserve line breaks', () => {
      const message = 'Line 1\nLine 2';
      const result = sanitizeMessage(message);
      expect(result).toContain('\n');
    });

    test('should handle null input', () => {
      const result = sanitizeMessage(null);
      expect(result).toBe('');
    });
  });

  describe('sanitizeUsername', () => {
    test('should remove special characters', () => {
      const username = 'john@#$doe';
      const result = sanitizeUsername(username);
      expect(result).not.toContain('@');
      expect(result).not.toContain('#');
      expect(result).not.toContain('$');
    });

    test('should allow alphanumeric and underscore', () => {
      const username = 'john_doe_123';
      const result = sanitizeUsername(username);
      expect(result).toMatch(/^[a-zA-Z0-9_]+$/);
    });

    test('should convert to lowercase', () => {
      const username = 'JohnDoe';
      const result = sanitizeUsername(username);
      expect(result).toBe('johndoe');
    });

    test('should trim whitespace', () => {
      const username = '  john  ';
      const result = sanitizeUsername(username);
      expect(result).toBe('john');
    });

    test('should handle empty string', () => {
      const result = sanitizeUsername('');
      expect(result).toBe('');
    });
  });

  describe('preventXSS', () => {
    test('should encode HTML entities', () => {
      const input = '<script>';
      const result = preventXSS(input);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });

    test('should handle quotes', () => {
      const input = 'He said "hello"';
      const result = preventXSS(input);
      expect(result).toContain('&quot;') || expect(result).toContain('"');
    });

    test('should handle single quotes', () => {
      const input = "It's";
      const result = preventXSS(input);
      expect(result).toBeTruthy();
    });

    test('should handle ampersands', () => {
      const input = 'bread & butter';
      const result = preventXSS(input);
      expect(result).toContain('&amp;');
    });

    test('should preserve safe text', () => {
      const input = 'Hello World 123';
      const result = preventXSS(input);
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });
  });

  describe('escapeHtml', () => {
    test('should escape HTML characters', () => {
      const input = '<div>Hello</div>';
      const result = escapeHtml(input);
      expect(result).not.toContain('<div>');
      expect(result).not.toContain('</div>');
    });

    test('should escape special HTML entities', () => {
      const input = '< > & " \'';
      const result = escapeHtml(input);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&amp;');
    });

    test('should handle JSON with angle brackets', () => {
      const input = '{"key": "<value>"}';
      const result = escapeHtml(input);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });

    test('should handle null gracefully', () => {
      const result = escapeHtml(null);
      expect(result).toBe('');
    });

    test('should handle undefined gracefully', () => {
      const result = escapeHtml(undefined);
      expect(result).toBe('');
    });
  });
});
