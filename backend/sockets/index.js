/**
 * Socket Event Handlers Registry
 * Centralizes all socket event listeners
 */

const joinRoomHandler = require('./joinRoom');
const roomMessageHandler = require('./roomMessage');
const dmHandler = require('./dm');
const dmHistoryHandler = require('./dmHistory');
const { handleUserDisconnect } = require('./utils');
const logger = require('../utils/logger');

/**
 * Initialize all socket event listeners
 */
function initializeSocketHandlers(io, socket, userSockets, usernameToSocket) {
    try {
        // Join room event
        socket.on('join-room', joinRoomHandler(io, socket, userSockets, usernameToSocket));

        // Leave room event
        socket.on('leave-room', ({ room, username }) => {
            try {
                if (userSockets[socket.id] && userSockets[socket.id].room === room) {
                    socket.leave(room);
                    delete userSockets[socket.id].room;

                    const roomUsers = Object.values(userSockets)
                        .filter(u => u.room === room)
                        .map(u => u.username);

                    io.to(room).emit('room-users', roomUsers);
                }
            } catch (err) {
                logger.error('Leave room error:', err.message);
            }
        });

        // Room message event
        socket.on('room-message', roomMessageHandler(io, socket, userSockets, usernameToSocket));

        // Direct message event
        socket.on('dm', dmHandler(io, socket, userSockets, usernameToSocket));

        // DM history event
        socket.on('get-dm-history', dmHistoryHandler(io, socket, userSockets, usernameToSocket));

        // Get users in room event
        socket.on('get-users', ({ room }) => {
            try {
                const roomUsers = Object.values(userSockets)
                    .filter(u => u.room === room)
                    .map(u => u.username);
                socket.emit('users-list', roomUsers);
            } catch (err) {
                logger.error('Get users error:', err.message);
            }
        });

        // Test event (for debugging)
        socket.on('test', (msg) => {
            logger.debug('Test event received:', msg);
            socket.emit('test-reply', 'Hello from backend!');
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            handleUserDisconnect(socket, userSockets, usernameToSocket, io);
        });

    } catch (err) {
        logger.error('Error initializing socket handlers:', err.message);
    }
}

module.exports = initializeSocketHandlers;
