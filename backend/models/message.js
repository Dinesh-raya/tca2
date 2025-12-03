const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String }, // null or undefined for room messages
    room: { type: String }, // null or undefined for DMs
    text: { type: String, required: true },
    timestamp: {
        type: Date,
        default: Date.now,
        index: { expires: '7d' } // Auto-delete after 7 days
    }
});

// CRITICAL: Add compound indexes for fast queries (Phase 1 - Performance optimization)
// Room history queries - sorted newest first
messageSchema.index({ room: 1, timestamp: -1 });

// DM history queries - both directions (user1->user2 and user2->user1)
messageSchema.index({ from: 1, to: 1, timestamp: -1 });

// Incoming DM queries
messageSchema.index({ to: 1, timestamp: -1 });

// User message queries
messageSchema.index({ from: 1, timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema);
