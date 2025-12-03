// backend/config/database.js
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const constants = require('../constants');

class Database {
    async connect() {
        try {
            await mongoose.connect(process.env.MONGODB_URI, constants.MONGOOSE_OPTIONS);
            logger.info('✅ MongoDB connected successfully');
            console.log('✅ MongoDB connected');
        } catch (error) {
            logger.error('❌ MongoDB connection error:', error);
            console.error('❌ MongoDB connection error:', error);
            process.exit(1);
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            logger.info('MongoDB disconnected');
            console.log('MongoDB disconnected');
        } catch (error) {
            logger.error('MongoDB disconnection error:', error);
        }
    }

    /**
     * Check database connection health
     */
    async checkHealth() {
        try {
            await mongoose.connection.db.admin().ping();
            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = new Database();
