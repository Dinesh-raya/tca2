// backend/routes/user.routes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { isLoggedIn } = require('../middleware/auth');
const socketManager = require('../socket/socketManager');

// GET /api/users/profile/:username - Get user profile
router.get('/profile/:username', isLoggedIn, async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select('-password -securityKey');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if user is online
        const isOnline = socketManager.getSocketId(username) !== undefined;

        res.json({
            username: user.username,
            role: user.role,
            createdAt: user._id.getTimestamp(),
            isOnline
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
