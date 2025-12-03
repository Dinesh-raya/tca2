// backend/scripts/migrateSecurityKeys.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

/**
 * Migration script to hash existing plain-text security keys
 * Run once to migrate existing data
 */
async function migrateSecurityKeys() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Find all users
        const users = await User.find({});
        console.log(`Found ${users.length} users to migrate`);

        let migrated = 0;
        let skipped = 0;

        for (const user of users) {
            // Check if security key is already hashed (bcrypt hashes start with $2)
            if (user.securityKey && !user.securityKey.startsWith('$2')) {
                const plainKey = user.securityKey;
                const hashedKey = await bcrypt.hash(plainKey, 10);
                user.securityKey = hashedKey;
                await user.save();
                console.log(`✅ Migrated security key for user: ${user.username}`);
                migrated++;
            } else {
                console.log(`⏭️  Skipped ${user.username} (already hashed or no key)`);
                skipped++;
            }
        }

        console.log(`\n✅ Migration complete!`);
        console.log(`   Migrated: ${migrated} users`);
        console.log(`   Skipped: ${skipped} users`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
}

migrateSecurityKeys();
