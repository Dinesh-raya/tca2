/**
 * Frontend Sanitization Utilities
 * Escapes HTML for terminal display to prevent XSS
 */

/**
 * Escapes HTML special characters for terminal display
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export const escapeHtml = (str) => {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};

/**
 * Sanitizes terminal output
 * Removes dangerous control sequences
 * @param {string} text - Terminal text
 * @returns {string} Sanitized text
 */
export const sanitizeTerminalOutput = (text) => {
    if (typeof text !== 'string') return '';
    // Remove control characters except newlines and carriage returns
    return text
        .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '')
        .trim();
};

/**
 * Sanitizes username for display
 * @param {string} username - Username
 * @returns {string} Sanitized username
 */
export const sanitizeUsername = (username) => {
    if (typeof username !== 'string') return '[Unknown]';
    return escapeHtml(username.substring(0, 20));
};

/**
 * Sanitizes room name for display
 * @param {string} roomName - Room name
 * @returns {string} Sanitized room name
 */
export const sanitizeRoomName = (roomName) => {
    if (typeof roomName !== 'string') return '[Unknown]';
    return escapeHtml(roomName.substring(0, 30));
};

/**
 * Sanitizes message text for display
 * @param {string} msg - Message text
 * @returns {string} Sanitized and escaped message
 */
export const sanitizeMessage = (msg) => {
    if (typeof msg !== 'string') return '';
    // First remove dangerous tags/handlers
    let sanitized = msg.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*['"]/gi, '');
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    // Then escape remaining HTML
    return escapeHtml(sanitized);
};
