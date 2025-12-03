// backend/socket/handlers/message.handler.js
const messageService = require('../../services/message.service');
const socketManager = require('../socketManager');
const { SOCKET_EVENTS } = require('../../constants');
const logger = require('../../utils/logger');

module.exports = (io, socket) => {
    // Room Message
    socket.on(SOCKET_EVENTS.ROOM_MESSAGE, async (data, callback) => {
        try {
            const currentUser = socketManager.getUser(socket.id);

            if (currentUser && currentUser.room === data.room) {
                await messageService.createRoomMessage(data.user, data.room, data.msg);

                io.to(data.room).emit(SOCKET_EVENTS.ROOM_MESSAGE, data);

                if (callback) callback({ status: 'ok' });
            } else {
                if (callback) callback({ status: 'error', msg: 'You are not in this room.' });
            }
        } catch (error) {
            logger.error(`Error sending message: ${error.message}`);
            if (callback) callback({ status: 'error', msg: 'Server error' });
        }
    });

    // Typing Indicators
    socket.on(SOCKET_EVENTS.TYPING, ({ room, username }) => {
        socket.to(room).emit(SOCKET_EVENTS.USER_TYPING, { username });
    });

    socket.on(SOCKET_EVENTS.STOP_TYPING, ({ room, username }) => {
        socket.to(room).emit(SOCKET_EVENTS.USER_STOP_TYPING, { username });
    });
};
