/**
 * Socket Authentication Middleware
 * Validates JWT tokens and user permissions for socket events
 */

const jwt = require('jsonwebtoken');

/**
 * Validates socket user is authenticated
 * @param {object} socket - Socket.io socket object
 * @returns {object} { valid: boolean, error: string (if invalid) }
 */
const validateSocketUser = (socket) => {
    if (!socket.user || !socket.user.id) {
        return { valid: false, error: 'Authentication required' };
    }
    if (!socket.user.username) {
        return { valid: false, error: 'User information missing' };
    }
    return { valid: true };
};

/**
 * Verifies user exists in database
 * @param {Model} User - User database model
 * @param {string} userId - User ID to verify
 * @returns {Promise<boolean>} true if user exists, false otherwise
 */
const verifyUserExists = async (User, userId) => {
    try {
        const user = await User.findById(userId);
        return user ? true : false;
    } catch (err) {
        return false;
    }
};

/**
 * Verifies user has access to room
 * @param {Model} Room - Room database model
 * @param {string} username - Username
 * @param {string} roomName - Room name
 * @returns {Promise<object>} { hasAccess: boolean, reason: string (if denied) }
 */
const verifyRoomAccess = async (Room, username, roomName) => {
    try {
        const room = await Room.findOne({ name: roomName });
        if (!room) {
            return { hasAccess: false, reason: 'Room not found' };
        }
        if (!room.allowedUsers.includes(username)) {
            return { hasAccess: false, reason: 'User not allowed in room' };
        }
        return { hasAccess: true };
    } catch (err) {
        return { hasAccess: false, reason: 'Permission check failed' };
    }
};

/**
 * Verifies JWT token validity
 * @param {string} token - JWT token
 * @param {string} secret - JWT secret
 * @returns {object|null} Decoded token or null if invalid
 */
const verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        return null;
    }
};

/**
 * Checks if user is admin
 * @param {object} socket - Socket.io socket object
 * @returns {boolean} true if user is admin, false otherwise
 */
const isAdmin = (socket) => {
    return socket.user && socket.user.role === 'admin';
};

/**
 * Gets authenticated user info from socket
 * @param {object} socket - Socket.io socket object
 * @returns {object|null} User object or null if not authenticated
 */
const getAuthenticatedUser = (socket) => {
    if (!socket.user) return null;
    return {
        id: socket.user.id,
        username: socket.user.username,
        role: socket.user.role
    };
};

module.exports = {
    validateSocketUser,
    verifyUserExists,
    verifyRoomAccess,
    verifyToken,
    isAdmin,
    getAuthenticatedUser
};
