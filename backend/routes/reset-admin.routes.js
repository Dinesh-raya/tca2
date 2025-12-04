// backend/routes/reset-admin.routes.js
// ⚠️ TEMPORARY ROUTE - DELETE THIS FILE AFTER USE
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');

// CORS bypass for this temporary endpoint
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

/**
 * TEMPORARY ENDPOINT - Reset admin credentials
 * POST /api/reset-admin
 * Body: { newPassword, newSecurityKey }
 */
router.post('/', async (req, res) => {
    try {
        const { newPassword, newSecurityKey } = req.body;

        if (!newPassword || !newSecurityKey) {
            return res.status(400).json({
                msg: 'Both newPassword and newSecurityKey are required'
            });
        }

        // Find admin user
        const admin = await User.findOne({ username: 'admin' });

        if (!admin) {
            return res.status(404).json({ msg: 'Admin user not found' });
        }

        // Hash new credentials
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const hashedSecurityKey = await bcrypt.hash(newSecurityKey, 10);

        // Update admin
        admin.password = hashedPassword;
        admin.securityKey = hashedSecurityKey;
        await admin.save();

        res.json({
            msg: '✅ Admin credentials updated successfully!',
            username: 'admin',
            newPassword: newPassword,
            newSecurityKey: newSecurityKey,
            warning: '⚠️ DELETE THIS ENDPOINT NOW!'
        });
    } catch (error) {
        console.error('Reset admin error:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

module.exports = router;
