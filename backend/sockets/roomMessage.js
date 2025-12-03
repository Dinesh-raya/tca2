/**
 * Room Message Socket Handler
 * Handles room messages
 */

const { validateMessage } = require('../utils/validation');
const { sanitizeInput } = require('../utils/sanitize');
const { validateSocketUser, verifyRoomAccess } = require('../middleware/socketAuth');
const logger = require('../utils/logger');
const Message = require('../models/message');
const Room = require('../models/room');

/**
 * Handle room-message event
 */
module.exports = (io, socket, userSockets, usernameToSocket) => {
    return async (data, callback) => {
        try {
            // Phase 1: Security - Re-validate authentication per-event
            const auth = validateSocketUser(socket);
            if (!auth.valid) {
                if (callback) callback({ status: 'error', msg: auth.error });
                return;
            }

            // Phase 1: Security - Validate message input
            if (!validateMessage(data.msg)) {
                if (callback) callback({ status: 'error', msg: 'Invalid message format or too long (max 1000 chars)' });
                return;
            }

            // Phase 1: Security - Verify room access
            const access = await verifyRoomAccess(Room, socket.user.username, data.room);
            if (!access.hasAccess) {
                if (callback) callback({ status: 'error', msg: access.reason });
                return;
            }

            // Verify user is in the room
            if (userSockets[socket.id]?.room !== data.room) {
                if (callback) callback({ status: 'error', msg: 'You are not in this room.' });
                return;
            }

            // Phase 1: Security - Sanitize message before storing
            const sanitizedMsg = sanitizeInput(data.msg);

            // Store message in database
            const message = await Message.create({
                from: socket.user.username,
                room: data.room,
                text: sanitizedMsg
            });

            // Emit sanitized message to all users in room
            io.to(data.room).emit('room-message', {
                room: data.room,
                user: socket.user.username,
                msg: sanitizedMsg,
                timestamp: message.timestamp
            });

            if (callback) callback({ status: 'ok' });
            logger.info(`Message in room ${data.room} from ${socket.user.username}`);
        } catch (err) {
            logger.error('Room message error:', err.message);
            if (callback) callback({ status: 'error', msg: 'Server error' });
        }
    };
};
