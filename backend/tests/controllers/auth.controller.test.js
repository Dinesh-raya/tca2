// backend/tests/controllers/auth.controller.test.js
const authController = require('../../controllers/auth.controller');
const userService = require('../../services/user.service');
const { validationResult } = require('express-validator');

// Mock dependencies
jest.mock('../../services/user.service');
jest.mock('express-validator');

describe('Auth Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return 400 if validation fails', async () => {
            validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => [{ msg: 'Invalid input' }]
            });

            await authController.login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: 'Invalid input' }] });
        });

        it('should return token on success', async () => {
            validationResult.mockReturnValue({ isEmpty: () => true });
            req.body = { username: 'test', password: 'password' };

            const mockResult = { token: 'abc', user: { id: 1, username: 'test' } };
            userService.login.mockResolvedValue(mockResult);

            await authController.login(req, res, next);

            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        it('should handle invalid credentials', async () => {
            validationResult.mockReturnValue({ isEmpty: () => true });
            userService.login.mockRejectedValue(new Error('Invalid credentials'));

            await authController.login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid credentials' });
        });
    });
});
