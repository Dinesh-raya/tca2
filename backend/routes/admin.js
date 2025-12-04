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
 * POST /api/admin/create-room
 * Create a new room (admin only)
 */
router.post('/create-room', isAdmin, async (req, res, next) => {
    try {
        const { roomName } = req.body;

        if (!roomName) {
            return res.status(400).json({ msg: 'Room name is required' });
        }

        // Validate room name format
        if (!/^[a-zA-Z0-9_-]+$/.test(roomName)) {
            return res.status(400).json({ msg: 'Room name can only contain letters, numbers, underscores, and hyphens' });
        }

        // Check if room already exists
        const existingRoom = await Room.findOne({ name: roomName });
        if (existingRoom) {
            return res.status(400).json({ msg: 'Room already exists' });
        }

        // Create new room with admin as the first allowed user
        const room = new Room({
            name: roomName,
            allowedUsers: [req.user.username]
        });

        await room.save();

        logger.info(`Admin ${req.user.username} created room ${roomName}`);
        res.json({ msg: `Room '${roomName}' created successfully` });
    } catch (err) {
        logger.error('Create room error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

/**
 * POST /api/admin/grant-bulk-access
 * Grant room access to multiple users at once (admin only)
 */
router.post('/grant-bulk-access', isAdmin, async (req, res, next) => {
    try {
        const { usernames, roomName } = req.body;

        if (!usernames || !roomName) {
            return res.status(400).json({ msg: 'Usernames array and room name are required' });
        }

        if (!Array.isArray(usernames) || usernames.length === 0) {
            return res.status(400).json({ msg: 'Usernames must be a non-empty array' });
        }

        const room = await Room.findOne({ name: roomName });
        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        const results = {
            granted: [],
            alreadyHasAccess: [],
            notFound: []
        };

        for (const username of usernames) {
            // Check if user already has access
            if (room.allowedUsers.includes(username)) {
                results.alreadyHasAccess.push(username);
                continue;
            }

            // Verify user exists
            const user = await User.findOne({ username });
            if (!user) {
                results.notFound.push(username);
                continue;
            }

            // Grant access
            room.allowedUsers.push(username);
            results.granted.push(username);
        }

        await room.save();

        logger.info(`Admin ${req.user.username} granted bulk access to room ${roomName}:`, results);

        let message = '';
        if (results.granted.length > 0) {
            message += `Granted access to: ${results.granted.join(', ')}. `;
        }
        if (results.alreadyHasAccess.length > 0) {
            message += `Already had access: ${results.alreadyHasAccess.join(', ')}. `;
        }
        if (results.notFound.length > 0) {
            message += `Users not found: ${results.notFound.join(', ')}.`;
        }

        res.json({ msg: message.trim(), results });
    } catch (err) {
        logger.error('Grant bulk access error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

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
