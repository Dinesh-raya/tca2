const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ⚠️ REPLACE THIS WITH YOUR CONNECTION STRING
const MONGODB_URI = "mongodb+srv://neekenduku:<YOUR_PASSWORD>@cluster0.mbxftzm.mongodb.net/test?appName=Cluster0";

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String,
    securityKey: String
});

const User = mongoose.model('User', userSchema);

async function testConnection() {
    console.log('🔄 Connecting to MongoDB...');
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected successfully!');

        console.log('🔍 Searching for admin user...');
        const admin = await User.findOne({ username: 'admin' });

        if (!admin) {
            console.log('❌ Admin user NOT found in this database.');
            console.log('   (Make sure you are connecting to the same database where you created the user)');
        } else {
            console.log('✅ Admin user FOUND!');
            console.log('   Username:', admin.username);
            console.log('   Role:', admin.role);
            console.log('   Stored Hash:', admin.password);

            console.log('🔐 Testing password "admin123"...');
            const isMatch = await bcrypt.compare('admin123', admin.password);

            if (isMatch) {
                console.log('✅ Password "admin123" is CORRECT!');
            } else {
                console.log('❌ Password "admin123" is INCORRECT.');
                console.log('   (The hash in the database does not match "admin123")');
            }
        }

    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected');
    }
}

testConnection();
