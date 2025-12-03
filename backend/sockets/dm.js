/**
 * Direct Message Socket Handler
 * Handles direct messages between users
 */

const { validateMessage, isValidUsername } = require('../utils/validation');
const { sanitizeInput } = require('../utils/sanitize');
const { validateSocketUser } = require('../middleware/socketAuth');
const logger = require('../utils/logger');
const Message = require('../models/message');

/**
 * Handle dm event
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

            // Phase 1: Security - Validate recipient username
            if (!isValidUsername(data.to)) {
                if (callback) callback({ status: 'error', msg: 'Invalid recipient username format' });
                return;
            }

            // Phase 1: Security - Validate message
            if (!validateMessage(data.msg)) {
                if (callback) callback({ status: 'error', msg: 'Invalid message format or too long (max 1000 chars)' });
                return;
            }

            const targetSocketId = usernameToSocket[data.to];

            // Track active DMs for sender
            if (userSockets[socket.id]) {
                if (!userSockets[socket.id].activeDMs) {
                    userSockets[socket.id].activeDMs = new Set();
                }
                userSockets[socket.id].activeDMs.add(data.to);
            }

            // Phase 1: Security - Sanitize message before storing
            const sanitizedMsg = sanitizeInput(data.msg);

            if (targetSocketId) {
                // Track active DMs for receiver
                if (userSockets[targetSocketId]) {
                    if (!userSockets[targetSocketId].activeDMs) {
                        userSockets[targetSocketId].activeDMs = new Set();
                    }
                    userSockets[targetSocketId].activeDMs.add(socket.user.username);
                }

                // Store message in database
                const message = await Message.create({
                    from: socket.user.username,
                    to: data.to,
                    text: sanitizedMsg
                });

                // Emit sanitized message to recipient
                io.to(targetSocketId).emit('dm', {
                    from: socket.user.username,
                    to: data.to,
                    msg: sanitizedMsg,
                    timestamp: message.timestamp
                });

                // Emit to sender's other connections
                socket.emit('dm', {
                    from: socket.user.username,
                    to: data.to,
                    msg: sanitizedMsg,
                    timestamp: message.timestamp
                });

                if (callback) callback({ status: 'ok' });
                logger.info(`DM from ${socket.user.username} to ${data.to}`);
            } else {
                socket.emit('dm-error', { msg: `User ${data.to} is not online.` });
                if (callback) callback({ status: 'error', msg: `User ${data.to} is not online.` });
            }
        } catch (err) {
            logger.error('DM error:', err.message);
            if (callback) callback({ status: 'error', msg: 'Server error' });
        }
    };
};
