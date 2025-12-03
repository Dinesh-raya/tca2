/**
 * Authentication Routes
 * Handles login, register, and password management
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const constants = require('../constants');
const User = require('../models/user');
const { isAdmin } = require('../middleware/auth');
const { validatePassword } = require('../utils/validation');

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', [
    body('username').trim().escape(),
    body('password').trim() // Don't escape password - preserve special chars
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: constants.JWT_EXPIRY },
            (err, token) => {
                if (err) {
                    logger.error('JWT sign error:', err);
                    return res.status(500).json({ msg: 'Token generation failed' });
                }
                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role
                    }
                });
            }
        );
    } catch (err) {
        logger.error('Login error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

/**
 * POST /api/auth/register
 * Admin: Register new user (admin only)
 */
router.post('/register', [
    isAdmin,
    body('username').trim().escape(),
    body('password').isLength({ min: constants.MIN_PASSWORD_LENGTH })
        .withMessage(`Password must be at least ${constants.MIN_PASSWORD_LENGTH} chars`)
        .trim(),
    body('securityKey').notEmpty().withMessage('Security key is required').trim()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password, securityKey } = req.body;

        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            username,
            password,
            role: 'user',
            securityKey
        });

        const salt = await bcrypt.genSalt(constants.BCRYPT_SALT_ROUNDS);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        logger.info(`User ${username} created successfully`);
        res.json({ msg: `User ${username} created successfully` });
    } catch (err) {
        logger.error('Register error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

/**
 * POST /api/auth/change-password
 * Change user password (requires old password + security key)
 */
router.post('/change-password', [
    body('oldPassword').notEmpty().withMessage('Old password is required').trim(),
    body('newPassword')
        .isLength({ min: constants.MIN_PASSWORD_LENGTH })
        .withMessage(`New password must be at least ${constants.MIN_PASSWORD_LENGTH} chars`)
        .trim(),
    body('securityKey').notEmpty().withMessage('Security key is required').trim()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { oldPassword, newPassword, securityKey } = req.body;

        const user = await User.findById(decoded.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Old password is incorrect' });
        }

        // Verify security key
        const isKeyValid = await bcrypt.compare(securityKey, user.securityKey);
        if (!isKeyValid) {
            return res.status(400).json({ msg: 'Security key is incorrect' });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(constants.BCRYPT_SALT_ROUNDS);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        logger.info(`Password changed for user: ${user.username}`);
        res.json({ msg: 'Password changed successfully! Please login again.' });
    } catch (err) {
        logger.error('Change password error:', err.message);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ msg: 'Invalid token' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
