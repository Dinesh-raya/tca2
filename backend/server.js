// backend/server.js
require('dotenv').config();

// Validate environment variables first
const validateEnvironment = require('./utils/validateEnv');
validateEnvironment();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression'); // Phase 4: Compression

const database = require('./config/database');
const socketSetup = require('./socket');
const logger = require('./utils/logger');
const constants = require('./constants');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/room.routes');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user.routes');

const app = express();
const server = http.createServer(app);

// Connect to Database
database.connect();

// Trust Proxy (Required for Render/Heroku)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Sanitize MongoDB queries
app.use(mongoSanitize());

// Performance Middleware
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
    windowMs: constants.RATE_LIMIT.WINDOW_MS,
    max: constants.RATE_LIMIT.MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/auth', limiter);

// CORS Configuration
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            if (process.env.NODE_ENV !== 'production') {
                return callback(null, true);
            }
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Backend is running');
});

// Health Check
app.get('/health', async (req, res) => {
    const isDbConnected = await database.checkHealth();
    if (isDbConnected) {
        res.json({
            status: 'healthy',
            uptime: process.uptime(),
            mongodb: 'connected',
            timestamp: new Date().toISOString(),
            version: '2.0.0'
        });
    } else {
        res.status(503).json({
            status: 'unhealthy',
            mongodb: 'disconnected'
        });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Initialize Socket Logic
socketSetup(io);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);
});
