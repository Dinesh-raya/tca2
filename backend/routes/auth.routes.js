// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const constants = require('../constants');

// Validation rules
const loginValidation = [
    body('username').trim().escape(),
    body('password').trim()
];

const registerValidation = [
    body('username').trim().escape(),
    body('password').isLength({ min: constants.MIN_PASSWORD_LENGTH }).withMessage(`Password must be at least ${constants.MIN_PASSWORD_LENGTH} chars`).trim(),
    body('securityKey').notEmpty().withMessage('Security key is required').trim()
];

const changePasswordValidation = [
    body('oldPassword').notEmpty().withMessage('Old password is required').trim(),
    body('newPassword').isLength({ min: constants.MIN_PASSWORD_LENGTH }).withMessage(`New password must be at least ${constants.MIN_PASSWORD_LENGTH} chars`).trim(),
    body('securityKey').notEmpty().withMessage('Security key is required').trim()
];

// Routes
router.post('/login', loginValidation, authController.login);
router.post('/register', [isAdmin, ...registerValidation], authController.register);
router.post('/change-password', [authMiddleware, ...changePasswordValidation], authController.changePassword);

module.exports = router;
