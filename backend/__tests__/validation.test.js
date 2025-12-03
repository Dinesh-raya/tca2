/**
 * Validation Utils Tests
 * Test Suite: 5 validators
 */

const {
  validateUsername,
  validatePassword,
  validateMessage,
  validateRoomName,
  validateEmail,
} = require('../../utils/validation');

describe('Validation Utils', () => {
  describe('validateUsername', () => {
    test('should accept valid username', () => {
      expect(validateUsername('johndoe')).toBe(true);
      expect(validateUsername('john_doe_123')).toBe(true);
    });

    test('should reject empty username', () => {
      expect(validateUsername('')).toBe(false);
    });

    test('should reject username with special characters', () => {
      expect(validateUsername('john@doe')).toBe(false);
      expect(validateUsername('john#doe')).toBe(false);
    });

    test('should reject username shorter than 3 characters', () => {
      expect(validateUsername('ab')).toBe(false);
    });

    test('should reject username longer than 50 characters', () => {
      expect(validateUsername('a'.repeat(51))).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('should accept valid password', () => {
      expect(validatePassword('SecurePass123!')).toBe(true);
      expect(validatePassword('MyPassword@2024')).toBe(true);
    });

    test('should reject password shorter than 8 characters', () => {
      expect(validatePassword('Pass12!')).toBe(false);
    });

    test('should reject password without uppercase', () => {
      expect(validatePassword('securepass123')).toBe(false);
    });

    test('should reject password without lowercase', () => {
      expect(validatePassword('SECUREPASS123')).toBe(false);
    });

    test('should reject password without numbers', () => {
      expect(validatePassword('SecurePass!')).toBe(false);
    });

    test('should reject empty password', () => {
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('validateMessage', () => {
    test('should accept valid message', () => {
      expect(validateMessage('Hello, this is a test message')).toBe(true);
    });

    test('should reject empty message', () => {
      expect(validateMessage('')).toBe(false);
    });

    test('should reject message longer than 2000 characters', () => {
      expect(validateMessage('a'.repeat(2001))).toBe(false);
    });

    test('should accept message with special characters', () => {
      expect(validateMessage('Hello! @# $ % ^ & * ()')).toBe(true);
    });

    test('should trim whitespace', () => {
      expect(validateMessage('   hello   ')).toBe(true);
    });
  });

  describe('validateRoomName', () => {
    test('should accept valid room name', () => {
      expect(validateRoomName('general')).toBe(true);
      expect(validateRoomName('random-room')).toBe(true);
    });

    test('should reject empty room name', () => {
      expect(validateRoomName('')).toBe(false);
    });

    test('should reject room name with invalid characters', () => {
      expect(validateRoomName('room@name')).toBe(false);
      expect(validateRoomName('room#name')).toBe(false);
    });

    test('should reject room name shorter than 3 characters', () => {
      expect(validateRoomName('ab')).toBe(false);
    });

    test('should reject room name longer than 100 characters', () => {
      expect(validateRoomName('a'.repeat(101))).toBe(false);
    });
  });

  describe('validateEmail', () => {
    test('should accept valid email', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('john.doe@company.co.uk')).toBe(true);
    });

    test('should reject email without @', () => {
      expect(validateEmail('userexample.com')).toBe(false);
    });

    test('should reject email without domain', () => {
      expect(validateEmail('user@')).toBe(false);
    });

    test('should reject invalid email format', () => {
      expect(validateEmail('user@.com')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });

    test('should reject empty email', () => {
      expect(validateEmail('')).toBe(false);
    });
  });
});
