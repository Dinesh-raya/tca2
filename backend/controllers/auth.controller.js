// backend/controllers/auth.controller.js
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../constants');
const logger = require('../utils/logger');

class AuthController {
    /**
     * Login user
     * POST /api/auth/login
     */
    async login(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ errors: errors.array() });
            }

            const { username, password } = req.body;
            const result = await userService.login(username, password);

            res.json(result);
        } catch (error) {
            if (error.message === 'Invalid credentials') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ msg: error.message });
            }
            next(error);
        }
    }

    /**
     * Register new user (Admin only)
     * POST /api/auth/register
     */
    async register(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ errors: errors.array() });
            }

            const { username, password, securityKey } = req.body;
            const result = await userService.createUser(username, password, securityKey);

            res.json({ msg: `User ${result.username} created successfully` });
        } catch (error) {
            if (error.message === 'User already exists') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ msg: error.message });
            }
            next(error);
        }
    }

    /**
     * Change password
     * POST /api/auth/change-password
     */
    async changePassword(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ errors: errors.array() });
            }

            const { oldPassword, newPassword, securityKey } = req.body;
            const userId = req.user.id;

            await userService.changePassword(userId, oldPassword, newPassword, securityKey);

            res.json({ msg: 'Password changed successfully! Please login again.' });
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ msg: error.message });
            }
            if (error.message === 'Old password is incorrect' || error.message === 'Security key is incorrect') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ msg: error.message });
            }
            next(error);
        }
    }
    /**
     * Debug endpoint to check DB connection and admin user
     * GET /api/auth/debug
     */
    async debug(req, res, next) {
        try {
            const mongoose = require('mongoose');
            const User = require('../models/user');
            const bcrypt = require('bcryptjs');

            const dbState = mongoose.connection.readyState;
            const dbName = mongoose.connection.name;
            const host = mongoose.connection.host;

            const adminUser = await User.findOne({ username: 'admin' });
            let passwordMatch = false;
            let userFound = false;

            if (adminUser) {
                userFound = true;
                passwordMatch = await bcrypt.compare('admin123', adminUser.password);
            }

            res.json({
                database: {
                    status: dbState === 1 ? 'Connected' : 'Disconnected',
                    name: dbName,
                    host: host
                },
                adminUser: {
                    found: userFound,
                    username: adminUser ? adminUser.username : null,
                    role: adminUser ? adminUser.role : null,
                    passwordCheck: passwordMatch ? 'MATCH' : 'MISMATCH'
                },
                env: {
                    node_env: process.env.NODE_ENV,
                    mongo_uri_set: !!process.env.MONGODB_URI
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AuthController();
