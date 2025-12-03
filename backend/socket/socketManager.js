// backend/socket/socketManager.js
const logger = require('../utils/logger');

class SocketManager {
    constructor() {
        this.userSockets = new Map(); // socketId -> { username, room, activeDMs }
        this.usernameToSocket = new Map(); // username -> socketId
    }

    /**
     * Register a user connection
     */
    registerUser(socketId, username) {
        this.userSockets.set(socketId, {
            username,
            room: null,
            activeDMs: new Set()
        });
        this.usernameToSocket.set(username, socketId);
        logger.info(`User ${username} registered on socket ${socketId}`);
    }

    /**
     * Remove a user connection
     */
    removeUser(socketId) {
        const userData = this.userSockets.get(socketId);
        if (userData) {
            this.usernameToSocket.delete(userData.username);
            this.userSockets.delete(socketId);
            return userData;
        }
        return null;
    }

    /**
     * Get user data by socket ID
     */
    getUser(socketId) {
        return this.userSockets.get(socketId);
    }

    /**
     * Get socket ID by username
     */
    getSocketId(username) {
        return this.usernameToSocket.get(username);
    }

    /**
     * Update user's current room
     */
    joinRoom(socketId, roomName) {
        const userData = this.userSockets.get(socketId);
        if (userData) {
            userData.room = roomName;
            this.userSockets.set(socketId, userData);
        }
    }

    /**
     * Remove user from current room
     */
    leaveRoom(socketId) {
        const userData = this.userSockets.get(socketId);
        if (userData) {
            userData.room = null;
            this.userSockets.set(socketId, userData);
        }
    }

    /**
     * Add active DM partner
     */
    addActiveDM(socketId, partnerUsername) {
        const userData = this.userSockets.get(socketId);
        if (userData) {
            userData.activeDMs.add(partnerUsername);
        }
    }

    /**
     * Get all users in a specific room
     */
    getUsersInRoom(roomName) {
        const users = [];
        for (const user of this.userSockets.values()) {
            if (user.room === roomName) {
                users.push(user.username);
            }
        }
        return users;
    }

    /**
     * Get all online users
     */
    getOnlineUsers() {
        return Array.from(this.usernameToSocket.keys());
    }
}

module.exports = new SocketManager();
