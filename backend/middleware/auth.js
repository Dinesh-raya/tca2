// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const { HTTP_STATUS } = require('../constants');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            msg: 'No token, authorization denied'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ msg: 'Token is not valid' });
    }
};

/**
 * Middleware to check if user is admin
 */
const isAdmin = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            msg: 'No token, authorization denied'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.user.role !== 'admin') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                msg: 'Access denied. Admin only.'
            });
        }

        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ msg: 'Token is not valid' });
    }
};

module.exports = { authMiddleware, isAdmin };
