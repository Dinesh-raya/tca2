// backend/socket/handlers/room.handler.js
const roomService = require('../../services/room.service');
const messageService = require('../../services/message.service');
const socketManager = require('../socketManager');
const { SOCKET_EVENTS } = require('../../constants');
const logger = require('../../utils/logger');

module.exports = (io, socket) => {
    // Join Room
    socket.on(SOCKET_EVENTS.JOIN_ROOM, async ({ room, username }) => {
        try {
            const { hasAccess, error } = await roomService.userHasAccess(room, username);

            if (!hasAccess) {
                socket.emit(SOCKET_EVENTS.JOIN_ROOM_ERROR, { msg: error });
                return;
            }

            // Leave previous room if any
            const currentUser = socketManager.getUser(socket.id);
            if (currentUser && currentUser.room) {
                socket.leave(currentUser.room);
            }

            socket.join(room);
            socketManager.joinRoom(socket.id, room);

            socket.emit(SOCKET_EVENTS.JOIN_ROOM_SUCCESS, { room });

            // Send room history
            const history = await messageService.getRoomHistory(room);
            socket.emit(SOCKET_EVENTS.ROOM_HISTORY, history);

            // Notify others
            io.to(room).emit(SOCKET_EVENTS.ROOM_USERS, socketManager.getUsersInRoom(room));

            logger.info(`User ${username} joined room ${room}`);
        } catch (error) {
            logger.error(`Error joining room: ${error.message}`);
            socket.emit(SOCKET_EVENTS.JOIN_ROOM_ERROR, { msg: 'Server error joining room' });
        }
    });

    // Leave Room
    socket.on(SOCKET_EVENTS.LEAVE_ROOM, ({ room, username }) => {
        const currentUser = socketManager.getUser(socket.id);

        if (currentUser && currentUser.room === room) {
            socket.leave(room);
            socketManager.leaveRoom(socket.id);

            io.to(room).emit(SOCKET_EVENTS.ROOM_USERS,
                socketManager.getUsersInRoom(room).filter(u => u !== username)
            );

            logger.info(`User ${username} left room ${room}`);
        }
    });

    // Get Users
    socket.on(SOCKET_EVENTS.GET_USERS, ({ room }) => {
        socket.emit(SOCKET_EVENTS.USERS_LIST, socketManager.getUsersInRoom(room));
    });
};
