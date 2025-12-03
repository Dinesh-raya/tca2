// backend/utils/validateEnv.js
const { JWT_MIN_SECRET_LENGTH } = require('../constants');

/**
 * Validate required environment variables
 * Exits process if validation fails
 */
function validateEnvironment() {
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingEnvVars.forEach(envVar => {
            console.error(`   - ${envVar}`);
        });
        console.error('\nPlease check your .env file and ensure all required variables are set.');
        process.exit(1);
    }

    // Validate JWT_SECRET strength
    if (process.env.JWT_SECRET.length < JWT_MIN_SECRET_LENGTH) {
        console.error(`❌ JWT_SECRET must be at least ${JWT_MIN_SECRET_LENGTH} characters long`);
        console.error(`   Current length: ${process.env.JWT_SECRET.length} characters`);
        console.error('\nPlease use a stronger JWT_SECRET in your .env file.');
        process.exit(1);
    }

    console.log('✅ Environment variables validated successfully');
}

module.exports = validateEnvironment;
