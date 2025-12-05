// backend/socket/index.js
const jwt = require('jsonwebtoken');
const socketManager = require('./socketManager');
const roomHandler = require('./handlers/room.handler');
const messageHandler = require('./handlers/message.handler');
const dmHandler = require('./handlers/dm.handler');
const { SOCKET_EVENTS } = require('../constants');
const logger = require('../utils/logger');

module.exports = (io) => {
    // Middleware for authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded.user;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    // Connection Handler
    io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
        if (socket.user) {
            socketManager.registerUser(socket.id, socket.user.username);

            // Broadcast online status (Feature: User Online Status)
            io.emit(SOCKET_EVENTS.USER_STATUS, {
                username: socket.user.username,
                status: 'online'
            });
        }

        // Register Handlers
        roomHandler(io, socket);
        messageHandler(io, socket);
        dmHandler(io, socket);

        // Logout
        socket.on(SOCKET_EVENTS.LOGOUT, () => {
            handleDisconnect(socket, io);
        });

        // Disconnect
        socket.on(SOCKET_EVENTS.DISCONNECT, () => {
            handleDisconnect(socket, io);
        });

        // Test Event
        socket.on(SOCKET_EVENTS.TEST, (msg) => {
            logger.info(`Test event received: ${msg}`);
            socket.emit(SOCKET_EVENTS.TEST_REPLY, 'Hello from backend!');
        });

        // Get Online Users (NEW FEATURE)
        socket.on('get-online-users', () => {
            const onlineUsers = socketManager.getOnlineUsers();
            socket.emit('online-users-list', { users: onlineUsers });
        });
    });
};

function handleDisconnect(socket, io) {
    const user = socketManager.removeUser(socket.id);
    const timestamp = new Date().toLocaleTimeString();

    if (user) {
        // Notify Room
        if (user.room) {
            socket.to(user.room).emit(SOCKET_EVENTS.ROOM_USERS,
                socketManager.getUsersInRoom(user.room).filter(u => u !== user.username)
            );
            socket.to(user.room).emit(SOCKET_EVENTS.ROOM_USER_DISCONNECT, {
                username: user.username,
                timestamp
            });
        }

        // Notify DM partners
        if (user.activeDMs) {
            user.activeDMs.forEach(partnerUsername => {
                const partnerSocketId = socketManager.getSocketId(partnerUsername);
                if (partnerSocketId) {
                    io.to(partnerSocketId).emit(SOCKET_EVENTS.DM_USER_DISCONNECT, {
                        username: user.username,
                        timestamp
                    });
                }
            });
        }

        // Broadcast offline status
        io.emit(SOCKET_EVENTS.USER_STATUS, {
            username: user.username,
            status: 'offline'
        });

        logger.info(`User disconnected: ${socket.id}`);
    }
}
