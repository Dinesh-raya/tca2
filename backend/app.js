/**
 * Express App Configuration
 * Handles middleware setup and route registration
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const constants = require('./constants');

const app = express();

// Trust Proxy (Required for Render/Heroku)
app.set('trust proxy', 1);

/**
 * Enhanced Security Middleware
 */
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

/**
 * Rate Limiting Middleware
 */
const limiter = rateLimit({
    windowMs: constants.RATE_LIMIT.WINDOW_MS,
    max: constants.RATE_LIMIT.MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/auth', limiter);

/**
 * CORS Configuration
 */
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000'];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // In development, you might want to allow localhost
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

/**
 * Body Parser Middleware
 */
app.use(express.json());

/**
 * Health Check Endpoint
 */
app.get('/health', require('./routes/health'));

/**
 * Basic Test Route
 */
app.get('/', (req, res) => {
    res.send('Backend is running');
});

/**
 * API Routes
 */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/rooms', require('./routes/rooms'));

/**
 * 404 Handler
 */
app.use((req, res) => {
    res.status(404).json({ msg: 'Route not found' });
});

/**
 * Error Handler Middleware
 */
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        msg: err.message || 'Server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;
