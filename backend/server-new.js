/**
 * Main Server Entry Point
 * Express + Socket.io application with modular architecture
 */

require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const validateEnvironment = require('./utils/validateEnv');

// Validate environment variables first
validateEnvironment();

// Import app with all routes
const app = require('./app');

// Import socket handlers
const initializeSocketHandlers = require('./sockets');

// Import JWT verification for socket.io
const jwt = require('jsonwebtoken');

// Create HTTP server with Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// User tracking
const userSockets = {}; // { socket.id: { username, room, activeDMs } }
const usernameToSocket = {}; // { username: socket.id }

/**
 * Socket.io Authentication Middleware
 * Verify JWT token on connection
 */
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('No token provided'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded.user;
        next();
    } catch (err) {
        logger.error('Socket connection error - Invalid token:', err.message);
        next(new Error('Invalid token'));
    }
});

/**
 * Socket.io Connection Handler
 */
io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.username} (${socket.id})`);
    
    // Initialize all event handlers for this socket
    initializeSocketHandlers(io, socket, userSockets, usernameToSocket);
});

/**
 * Database Connection
 */
mongoose.connect(process.env.MONGODB_URI)
    .then(() => logger.info('MongoDB connected'))
    .catch(err => {
        logger.error('MongoDB connection error:', err.message);
        process.exit(1);
    });

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

/**
 * Graceful Shutdown
 */
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Server closed');
        mongoose.connection.close(false, () => {
            logger.info('MongoDB connection closed');
            process.exit(0);
        });
    });
});

module.exports = server;
