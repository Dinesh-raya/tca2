// backend/socket/handlers/dm.handler.js
const messageService = require('../../services/message.service');
const socketManager = require('../socketManager');
const { SOCKET_EVENTS } = require('../../constants');
const logger = require('../../utils/logger');

module.exports = (io, socket) => {
    // Direct Message
    socket.on(SOCKET_EVENTS.DM, async (data, callback) => {
        try {
            const targetSocketId = socketManager.getSocketId(data.to);

            // Track active DMs
            socketManager.addActiveDM(socket.id, data.to);

            if (targetSocketId) {
                socketManager.addActiveDM(targetSocketId, data.from);

                await messageService.createDM(data.from, data.to, data.msg);

                io.to(targetSocketId).emit(SOCKET_EVENTS.DM, data);
                socket.emit(SOCKET_EVENTS.DM, data); // Echo to sender

                if (callback) callback({ status: 'ok' });
            } else {
                socket.emit(SOCKET_EVENTS.DM_ERROR, { msg: `User ${data.to} is not online.` });
                if (callback) callback({ status: 'error', msg: `User ${data.to} is not online.` });
            }
        } catch (error) {
            logger.error(`Error sending DM: ${error.message}`);
            if (callback) callback({ status: 'error', msg: 'Server error' });
        }
    });

    // Get DM History
    socket.on(SOCKET_EVENTS.GET_DM_HISTORY, async ({ user1, user2 }) => {
        try {
            // Mark as active DM
            socketManager.addActiveDM(socket.id, user2);

            const targetSocketId = socketManager.getSocketId(user2);
            if (targetSocketId) {
                socketManager.addActiveDM(targetSocketId, user1);
            }

            const history = await messageService.getDMHistory(user1, user2);
            socket.emit(SOCKET_EVENTS.DM_HISTORY, history);
        } catch (error) {
            logger.error(`Error fetching DM history: ${error.message}`);
        }
    });
};
