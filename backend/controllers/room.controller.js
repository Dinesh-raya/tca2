// backend/controllers/room.controller.js
const roomService = require('../services/room.service');
const { HTTP_STATUS } = require('../constants');

class RoomController {
    /**
     * List all rooms
     * GET /api/rooms
     */
    async listRooms(req, res, next) {
        try {
            const rooms = await roomService.getAllRoomNames();
            res.json(rooms);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RoomController();
