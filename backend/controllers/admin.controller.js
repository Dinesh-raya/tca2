// backend/controllers/admin.controller.js
const roomService = require('../services/room.service');
const { HTTP_STATUS } = require('../constants');

class AdminController {
    /**
     * Grant room access to user
     * POST /api/admin/grant-room-access
     */
    async grantRoomAccess(req, res, next) {
        try {
            const { username, roomName } = req.body;

            const result = await roomService.grantAccess(roomName, username);

            res.json({ msg: result.message });
        } catch (error) {
            if (error.message === 'Room not found') {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ msg: error.message });
            }
            next(error);
        }
    }
}

module.exports = new AdminController();
