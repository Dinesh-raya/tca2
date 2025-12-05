// backend/routes/room.routes.js
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const Room = require('../models/room');
const { isLoggedIn } = require('../middleware/auth');
const socketManager = require('../socket/socketManager');

router.get('/', roomController.listRooms);

// GET /api/rooms/info/:roomName - Get room info
router.get('/info/:roomName', isLoggedIn, async (req, res) => {
    try {
        const { roomName } = req.params;
        const room = await Room.findOne({ name: roomName });

        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        const onlineUsers = socketManager.getUsersInRoom(roomName);

        res.json({
            name: room.name,
            memberCount: room.allowedUsers.length,
            onlineCount: onlineUsers.length,
            createdAt: room._id.getTimestamp()
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
