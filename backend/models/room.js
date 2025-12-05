const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    allowedUsers: [{ type: String, required: true }], // usernames allowed in this room
    bannedUsers: [{ type: String }] // usernames banned from this room
});

// CRITICAL: Add indexes for fast permission checks (Phase 1 - Performance optimization)
// Permission lookups - checking if user has access to room
roomSchema.index({ allowedUsers: 1 });

// Room name lookups
roomSchema.index({ name: 1 });

module.exports = mongoose.model('Room', roomSchema);
