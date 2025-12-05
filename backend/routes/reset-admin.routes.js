const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

router.get('/reset-admin', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const hashedSecurityKey = await bcrypt.hash('secret123', 10);

        let admin = await User.findOne({ username: 'admin' });

        if (admin) {
            admin.password = hashedPassword;
            admin.securityKey = hashedSecurityKey;
            await admin.save();
            res.json({ msg: 'Admin password reset to admin123' });
        } else {
            await User.create({
                username: 'admin',
                password: hashedPassword,
                role: 'admin',
                securityKey: hashedSecurityKey
            });
            res.json({ msg: 'Admin user created with password admin123' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
