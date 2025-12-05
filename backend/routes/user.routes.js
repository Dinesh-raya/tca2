// backend/routes/user.routes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { isLoggedIn } = require('../middleware/auth');
const socketManager = require('../socket/socketManager');
const logger = require('../utils/logger');

// GET /api/users/profile/:username - Get user profile
router.get('/profile/:username', isLoggedIn, async (req, res) => {
    try {
        const { username } = req.params;
        logger.info(`Profile request for user: ${username}`);

        const user = await User.findOne({ username }).select('-password -securityKey');

        if (!user) {
            logger.warn(`User not found: ${username}`);
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if user is online
        const isOnline = socketManager.getSocketId(username) !== undefined;

        // Get createdAt from MongoDB ObjectId timestamp
        const createdAt = user._id.getTimestamp ? user._id.getTimestamp() : new Date();

        res.json({
            username: user.username,
            role: user.role || 'user',
            createdAt: createdAt,
            isOnline
        });
    } catch (err) {
        logger.error('Profile error:', err.message);
        res.status(500).json({ msg: 'Server error: ' + err.message });
    }
});

module.exports = router;
