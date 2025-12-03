/**
 * Health Check Route
 * Monitors service health and dependencies
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * GET /health
 * Returns health status of the service and dependencies
 */
module.exports = async (req, res) => {
    try {
        // Check MongoDB connection
        await mongoose.connection.db.admin().ping();

        res.json({
            status: 'healthy',
            uptime: process.uptime(),
            mongodb: 'connected',
            timestamp: new Date().toISOString(),
            version: '2.0.0'
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            mongodb: 'disconnected',
            error: error.message
        });
    }
};
