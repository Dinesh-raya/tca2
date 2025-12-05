// backend/tests/utils/validateEnv.test.js
const validateEnvironment = require('../../utils/validateEnv');

describe('Environment Validation', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
        // Mock console.error and process.exit
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(process, 'exit').mockImplementation(() => { });
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.restoreAllMocks();
    });

    it('should exit if required variables are missing', () => {
        process.env.JWT_SECRET = 'a_valid_secret';
        delete process.env.MONGODB_URI;
        validateEnvironment();
        expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should exit if JWT_SECRET is too short', () => {
        process.env.JWT_SECRET = 'short';
        validateEnvironment();
        expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should pass if all variables are valid', () => {
        process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
        process.env.JWT_SECRET = 'verylongsecretkeythatissecureenough';
        process.env.PORT = '5000';
        validateEnvironment();
        expect(process.exit).not.toHaveBeenCalled();
    });
});
