// backend/tests/utils/logger.test.js
const logger = require('../../utils/logger');
const winston = require('winston');

describe('Logger Utility', () => {
    it('should be a winston logger instance', () => {
        expect(logger).toBeDefined();
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.error).toBe('function');
    });

    it('should have correct transports', () => {
        expect(logger.transports.length).toBeGreaterThan(0);
    });
});
