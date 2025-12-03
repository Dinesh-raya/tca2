/**
 * Sanitization Utilities
 * Prevents XSS attacks by escaping and sanitizing user input
 */

/**
 * Escapes HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for HTML
 */
const escapeHtml = (str) => {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};

/**
 * Sanitizes user input to prevent XSS
 * Removes script tags and event handlers, then escapes HTML
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    
    // Remove script tags and dangerous content
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove event handlers (onclick, onerror, onload, etc.)
    sanitized = sanitized.replace(/on\w+\s*=\s*['"]/gi, '');
    
    // Remove iframe tags
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    
    // Escape remaining HTML
    return escapeHtml(sanitized);
};

/**
 * Sanitizes terminal output
 * Removes control sequences that could manipulate terminal
 * @param {string} text - Terminal text
 * @returns {string} Sanitized text
 */
const sanitizeTerminalOutput = (text) => {
    if (typeof text !== 'string') return '';
    // Remove ANSI control sequences (except basic ones)
    return text
        .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '')
        .trim();
};

/**
 * Sanitizes username (frontend display)
 * @param {string} username - Username to display
 * @returns {string} Sanitized username
 */
const sanitizeUsername = (username) => {
    if (typeof username !== 'string') return '[Unknown]';
    return escapeHtml(username.substring(0, 20)); // Limit length
};

module.exports = {
    escapeHtml,
    sanitizeInput,
    sanitizeTerminalOutput,
    sanitizeUsername
};
