/**
 * Input Validation Utilities
 * Validates all user inputs to prevent injection attacks, buffer overflow, etc.
 */

/**
 * Validates message text
 * @param {string} text - Message text
 * @returns {boolean} true if valid, false otherwise
 */
const validateMessage = (text) => {
    if (!text || typeof text !== 'string') return false;
    if (text.trim().length === 0) return false;
    if (text.length > 1000) return false;
    return true;
};

/**
 * Validates room name format
 * Only alphanumeric, underscore, and hyphen allowed
 * @param {string} name - Room name
 * @returns {boolean} true if valid, false otherwise
 */
const isValidRoomName = (name) => {
    if (!name || typeof name !== 'string') return false;
    return /^[a-zA-Z0-9_-]{1,50}$/.test(name);
};

/**
 * Validates username format
 * Only alphanumeric and underscore allowed, 3-20 characters
 * @param {string} name - Username
 * @returns {boolean} true if valid, false otherwise
 */
const isValidUsername = (name) => {
    if (!name || typeof name !== 'string') return false;
    return /^[a-zA-Z0-9_]{3,20}$/.test(name);
};

/**
 * Validates password strength
 * Requires: 8+ chars, uppercase letter, number
 * @param {string} password - Password
 * @returns {object} { valid: boolean, errors: [] }
 */
const validatePassword = (password) => {
    const errors = [];
    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain number');
    }
    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Validates security key (for password reset)
 * @param {string} key - Security key
 * @returns {boolean} true if valid, false otherwise
 */
const isValidSecurityKey = (key) => {
    if (!key || typeof key !== 'string') return false;
    return key.length >= 6 && key.length <= 100;
};

module.exports = {
    validateMessage,
    isValidRoomName,
    isValidUsername,
    validatePassword,
    isValidSecurityKey
};
