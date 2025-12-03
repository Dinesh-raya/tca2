/**
 * Rooms Routes
 * Handles room-related operations
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const Room = require('../models/room');

/**
 * GET /api/rooms
 * List all rooms (for /listrooms command)
 */
router.get('/', async (req, res, next) => {
    try {
        const rooms = await Room.find({}, 'name').lean();
        res.json(rooms.map(r => r.name));
    } catch (err) {
        logger.error('Get rooms error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

/**
 * GET /api/rooms/:roomName
 * Get room details
 */
router.get('/:roomName', async (req, res, next) => {
    try {
        const { roomName } = req.params;
        const room = await Room.findOne({ name: roomName })
            .populate('allowedUsers', 'username')
            .lean();

        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        res.json(room);
    } catch (err) {
        logger.error('Get room error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
