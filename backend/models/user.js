const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    securityKey: { type: String, required: true }
});

// CRITICAL: Add indexes for fast user lookups (Phase 1 - Performance optimization)
// Login lookups - finding user by username
userSchema.index({ username: 1 });

// Admin queries - finding all admins
userSchema.index({ role: 1 });

// Middleware to hash securityKey before saving (if it's been modified and not already hashed)
userSchema.pre('save', async function (next) {
    // Only hash if securityKey is modified and not already a hash
    if (this.isModified('securityKey') && !this.securityKey.startsWith('$2')) {
        this.securityKey = await bcrypt.hash(this.securityKey, 10);
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
