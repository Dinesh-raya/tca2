// backend/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { isAdmin } = require('../middleware/auth');

router.post('/grant-room-access', isAdmin, adminController.grantRoomAccess);

module.exports = router;
