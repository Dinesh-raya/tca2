// backend/services/room.service.js
const Room = require('../models/room');
const NodeCache = require('node-cache');
const roomCache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

class RoomService {
    /**
     * Get all room names
     */
    async getAllRoomNames() {
        const cachedRooms = roomCache.get('allRooms');
        if (cachedRooms) {
            return cachedRooms;
        }

        const rooms = await Room.find({}, 'name').lean();
        const roomNames = rooms.map(r => r.name);

        roomCache.set('allRooms', roomNames);
        return roomNames;
    }

    /**
     * Get room by name
     */
    async getRoomByName(roomName) {
        return await Room.findOne({ name: roomName });
    }

    /**
     * Check if user has access to room
     */
    async userHasAccess(roomName, username) {
        const room = await Room.findOne({ name: roomName });

        if (!room) {
            return { hasAccess: false, error: 'Room does not exist' };
        }

        if (!room.allowedUsers.includes(username)) {
            return { hasAccess: false, error: 'You are not allowed to join this room' };
        }

        return { hasAccess: true, room };
    }

    /**
     * Grant room access to a user
     */
    async grantAccess(roomName, username) {
        const room = await Room.findOne({ name: roomName });

        if (!room) {
            throw new Error('Room not found');
        }

        if (room.allowedUsers.includes(username)) {
            return { message: `${username} already has access to ${roomName}`, alreadyHasAccess: true };
        }

        room.allowedUsers.push(username);
        await room.save();

        return { message: `Granted ${username} access to ${roomName}`, alreadyHasAccess: false };
    }
}

module.exports = new RoomService();
