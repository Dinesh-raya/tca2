// backend/services/user.service.js
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const constants = require('../constants');

class UserService {
    /**
     * Authenticate user and return JWT token
     */
    async login(username, password) {
        const user = await User.findOne({ username });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const payload = {
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: constants.JWT_EXPIRY
        });

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        };
    }

    /**
     * Create a new user (admin only)
     */
    async createUser(username, password, securityKey) {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(constants.BCRYPT_SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            password: hashedPassword,
            role: 'user',
            securityKey // Will be auto-hashed by model pre-save hook
        });

        await user.save();

        return {
            username: user.username,
            role: user.role
        };
    }

    /**
     * Change user password
     */
    async changePassword(userId, oldPassword, newPassword, securityKey) {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new Error('Old password is incorrect');
        }

        // Verify security key
        const isKeyValid = await bcrypt.compare(securityKey, user.securityKey);
        if (!isKeyValid) {
            throw new Error('Security key is incorrect');
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(constants.BCRYPT_SALT_ROUNDS);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return true;
    }
}

module.exports = new UserService();
