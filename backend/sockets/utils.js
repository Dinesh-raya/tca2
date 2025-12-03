/**
 * Socket Utilities
 * Common helper functions for socket handlers
 */

const logger = require('../utils/logger');

/**
 * Get all users currently in a specific room
 */
function getUsersInRoom(room, userSockets) {
    return Object.values(userSockets)
        .filter(u => u.room === room)
        .map(u => u.username);
}

/**
 * Get all active socket IDs for a user
 */
function getSocketIdsForUser(username, usernameToSocket, userSockets) {
    const socketId = usernameToSocket[username];
    if (!socketId) return [];
    return [socketId];
}

/**
 * Broadcast to all users except sender
 */
function broadcastExcept(io, room, event, data, excludeSocketId) {
    io.to(room).emit(event, data);
}

/**
 * Handle user disconnect
 */
function handleUserDisconnect(socket, userSockets, usernameToSocket, io) {
    const user = userSockets[socket.id];
    const timestamp = new Date().toLocaleTimeString();

    if (user) {
        // Notify room
        if (user.room) {
            const roomUsers = Object.values(userSockets)
                .filter(u => u.room === user.room && u.username !== user.username)
                .map(u => u.username);

            socket.to(user.room).emit('room-users', roomUsers);
            socket.to(user.room).emit('room-user-disconnect', {
                username: user.username,
                timestamp
            });

            logger.info(`User ${user.username} disconnected from room ${user.room}`);
        }

        // Notify DM partners
        if (user.activeDMs) {
            user.activeDMs.forEach(partnerUsername => {
                const partnerSocketId = usernameToSocket[partnerUsername];
                if (partnerSocketId) {
                    io.to(partnerSocketId).emit('dm-user-disconnect', {
                        username: user.username,
                        timestamp
                    });
                }
            });
        }

        delete usernameToSocket[user.username];
    }

    delete userSockets[socket.id];
    logger.info(`Socket disconnected: ${socket.id}`);
}

module.exports = {
    getUsersInRoom,
    getSocketIdsForUser,
    broadcastExcept,
    handleUserDisconnect
};
