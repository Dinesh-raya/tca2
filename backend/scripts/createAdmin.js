// backend/scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const User = require('../models/user');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            const answer = await askQuestion('Do you want to reset the admin password? (yes/no): ');
            if (answer.toLowerCase() !== 'yes') {
                console.log('Aborted.');
                process.exit(0);
            }
        }

        // Get credentials
        const username = await askQuestion('Enter admin username (default: admin): ') || 'admin';
        const password = await askQuestion('Enter admin password (min 6 chars): ');
        const securityKey = await askQuestion('Enter security key for admin: ');

        if (password.length < 6) {
            console.error('❌ Password must be at least 6 characters');
            process.exit(1);
        }

        if (!securityKey) {
            console.error('❌ Security key is required');
            process.exit(1);
        }

        // Hash password and security key
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedSecurityKey = await bcrypt.hash(securityKey, 10);

        // Create or update admin
        if (existingAdmin) {
            existingAdmin.password = hashedPassword;
            existingAdmin.securityKey = hashedSecurityKey;
            await existingAdmin.save();
            console.log(`✅ Admin user "${username}" password updated successfully!`);
        } else {
            await User.create({
                username,
                password: hashedPassword,
                role: 'admin',
                securityKey: hashedSecurityKey
            });
            console.log(`✅ Admin user "${username}" created successfully!`);
        }

        console.log('\n📝 SAVE THESE CREDENTIALS:');
        console.log(`   Username: ${username}`);
        console.log(`   Password: ${password}`);
        console.log(`   Security Key: ${securityKey}`);
        console.log('\n⚠️  DO NOT LOSE THESE! They are not retrievable.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

createAdmin();
