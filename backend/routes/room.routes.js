// backend/routes/room.routes.js
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');

router.get('/', roomController.listRooms);

module.exports = router;
