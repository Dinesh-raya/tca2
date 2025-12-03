/**
 * Admin Routes
 * Handles admin operations (grant/revoke room access, user management)
 */

const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const logger = require('../utils/logger');
const Room = require('../models/room');
const User = require('../models/user');

/**
 * POST /api/admin/grant-room-access
 * Grant room access to user (admin only)
 */
router.post('/grant-room-access', isAdmin, async (req, res, next) => {
    try {
        const { username, roomName } = req.body;

        if (!username || !roomName) {
            return res.status(400).json({ msg: 'Username and room name are required' });
        }

        const room = await Room.findOne({ name: roomName });
        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if user already has access
        if (room.allowedUsers.includes(user._id)) {
            return res.status(400).json({ msg: 'User already has access to this room' });
        }

        room.allowedUsers.push(user._id);
        await room.save();

        logger.info(`Admin ${req.user.username} granted ${username} access to room ${roomName}`);
        res.json({ msg: `Granted ${username} access to ${roomName}` });
    } catch (err) {
        logger.error('Grant room access error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

/**
 * POST /api/admin/revoke-room-access
 * Revoke room access from user (admin only)
 */
router.post('/revoke-room-access', isAdmin, async (req, res, next) => {
    try {
        const { username, roomName } = req.body;

        if (!username || !roomName) {
            return res.status(400).json({ msg: 'Username and room name are required' });
        }

        const room = await Room.findOne({ name: roomName });
        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Remove user from allowedUsers
        room.allowedUsers = room.allowedUsers.filter(id => !id.equals(user._id));
        await room.save();

        logger.info(`Admin ${req.user.username} revoked ${username} access to room ${roomName}`);
        res.json({ msg: `Revoked ${username} access to ${roomName}` });
    } catch (err) {
        logger.error('Revoke room access error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
router.get('/users', isAdmin, async (req, res, next) => {
    try {
        const users = await User.find({}, 'username role createdAt').lean();
        res.json(users);
    } catch (err) {
        logger.error('Get users error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

/**
 * DELETE /api/admin/users/:username
 * Delete user (admin only)
 */
router.delete('/users/:username', isAdmin, async (req, res, next) => {
    try {
        const { username } = req.params;

        if (username === 'admin') {
            return res.status(400).json({ msg: 'Cannot delete admin user' });
        }

        const user = await User.findOneAndDelete({ username });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        logger.info(`Admin ${req.user.username} deleted user ${username}`);
        res.json({ msg: `User ${username} deleted` });
    } catch (err) {
        logger.error('Delete user error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
