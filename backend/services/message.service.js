// backend/services/message.service.js
const Message = require('../models/message');
const constants = require('../constants');

class MessageService {
    /**
     * Get room message history
     */
    async getRoomHistory(roomName, limit = constants.MESSAGE_HISTORY_LIMIT) {
        return await Message.find({ room: roomName })
            .sort({ timestamp: 1 })
            .limit(limit)
            .lean();
    }

    /**
     * Get DM history between two users
     */
    async getDMHistory(user1, user2, limit = constants.MESSAGE_HISTORY_LIMIT) {
        return await Message.find({
            $or: [
                { from: user1, to: user2 },
                { from: user2, to: user1 }
            ]
        })
            .sort({ timestamp: 1 })
            .limit(limit)
            .lean();
    }

    /**
     * Create a new room message
     */
    async createRoomMessage(from, room, text) {
        return await Message.create({ from, room, text });
    }

    /**
     * Create a new DM
     */
    async createDM(from, to, text) {
        return await Message.create({ from, to, text });
    }

    /**
     * Search messages in a room
     */
    async searchRoomMessages(roomName, query, limit = 20) {
        return await Message.find({
            room: roomName,
            text: { $regex: query, $options: 'i' }
        })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();
    }
}

module.exports = new MessageService();
