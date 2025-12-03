/**
 * Join Room Socket Handler
 * Handles user joining a room
 */

const { isValidRoomName, isValidUsername } = require('../utils/validation');
const { validateSocketUser, verifyRoomAccess } = require('../middleware/socketAuth');
const logger = require('../utils/logger');
const Room = require('../models/room');
const Message = require('../models/message');

/**
 * Handle join-room event
 */
module.exports = (io, socket, userSockets, usernameToSocket) => {
    return async (data) => {
        try {
            // Phase 1: Security - Validate input format
            if (!isValidRoomName(data.room) || !isValidUsername(data.username)) {
                socket.emit('join-room-error', { msg: 'Invalid room or username format' });
                return;
            }

            // Phase 1: Security - Re-validate authentication per-event
            const auth = validateSocketUser(socket);
            if (!auth.valid) {
                socket.emit('join-room-error', { msg: auth.error });
                return;
            }

            const authenticatedUsername = auth.username;
            const room = data.room;

            // Verify room exists
            const roomDoc = await Room.findOne({ name: room });
            if (!roomDoc) {
                socket.emit('join-room-error', { msg: 'Room does not exist.' });
                return;
            }

            // Phase 1: Security - Verify room access
            const access = await verifyRoomAccess(Room, authenticatedUsername, room);
            if (!access.hasAccess) {
                socket.emit('join-room-error', { msg: access.reason });
                return;
            }

            // Leave previous room if any
            if (userSockets[socket.id]?.room) {
                socket.leave(userSockets[socket.id].room);
            }

            socket.join(room);

            // Initialize or preserve activeDMs
            const existingDMs = userSockets[socket.id]?.activeDMs || new Set();
            userSockets[socket.id] = { username: authenticatedUsername, room, activeDMs: existingDMs };
            usernameToSocket[authenticatedUsername] = socket.id;

            socket.emit('join-room-success', { room });

            // Fetch last 20 messages for the room
            const history = await Message.find({ room }).sort({ timestamp: 1 }).limit(20);
            socket.emit('room-history', history);

            // Get users in room
            const roomUsers = Object.values(userSockets)
                .filter(u => u.room === room)
                .map(u => u.username);

            io.to(room).emit('room-users', roomUsers);

            logger.info(`User ${authenticatedUsername} joined room ${room}`);
        } catch (err) {
            logger.error('Join room error:', err.message);
            socket.emit('join-room-error', { msg: 'Server error' });
        }
    };
};
