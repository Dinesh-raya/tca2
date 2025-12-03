/**
 * DM History Socket Handler
 * Handles fetching DM conversation history
 */

const { isValidUsername } = require('../utils/validation');
const { validateSocketUser } = require('../middleware/socketAuth');
const logger = require('../utils/logger');
const Message = require('../models/message');

/**
 * Handle get-dm-history event
 */
module.exports = (io, socket, userSockets, usernameToSocket) => {
    return async (data) => {
        try {
            const { user1, user2 } = data;

            // Phase 1: Security - Validate usernames
            if (!isValidUsername(user1) || !isValidUsername(user2)) {
                socket.emit('dm-error', { msg: 'Invalid username format' });
                return;
            }

            // Mark as active DM when history is requested
            if (userSockets[socket.id]) {
                if (!userSockets[socket.id].activeDMs) {
                    userSockets[socket.id].activeDMs = new Set();
                }
                userSockets[socket.id].activeDMs.add(user2);
            }

            const targetSocketId = usernameToSocket[user2];
            if (targetSocketId && userSockets[targetSocketId]) {
                if (!userSockets[targetSocketId].activeDMs) {
                    userSockets[targetSocketId].activeDMs = new Set();
                }
                userSockets[targetSocketId].activeDMs.add(user1);
            }

            // Fetch DM history (both directions)
            const history = await Message.find({
                $or: [
                    { from: user1, to: user2 },
                    { from: user2, to: user1 }
                ]
            }).sort({ timestamp: 1 }).limit(20).lean();

            socket.emit('dm-history', history);
            logger.info(`DM history requested between ${user1} and ${user2}`);
        } catch (err) {
            logger.error('Get DM history error:', err.message);
            socket.emit('dm-error', { msg: 'Server error' });
        }
    };
};
