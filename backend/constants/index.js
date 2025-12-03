// backend/constants/index.js

module.exports = {
    // JWT Configuration
    JWT_EXPIRY: '24h',
    JWT_MIN_SECRET_LENGTH: 32,

    // Message Configuration
    MESSAGE_HISTORY_LIMIT: 20,
    MAX_MESSAGE_LENGTH: 1000,
    MESSAGE_TTL_DAYS: 7,

    // Password Configuration
    MIN_PASSWORD_LENGTH: 6,
    BCRYPT_SALT_ROUNDS: 10,

    // Rate Limiting
    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 100
    },

    // Socket.io Events
    SOCKET_EVENTS: {
        // Connection
        CONNECTION: 'connection',
        DISCONNECT: 'disconnect',
        CONNECT_ERROR: 'connect_error',

        // Authentication
        LOGOUT: 'logout',

        // Rooms
        JOIN_ROOM: 'join-room',
        JOIN_ROOM_SUCCESS: 'join-room-success',
        JOIN_ROOM_ERROR: 'join-room-error',
        LEAVE_ROOM: 'leave-room',
        ROOM_MESSAGE: 'room-message',
        ROOM_HISTORY: 'room-history',
        ROOM_USERS: 'room-users',
        GET_USERS: 'get-users',
        USERS_LIST: 'users-list',
        ROOM_USER_DISCONNECT: 'room-user-disconnect',

        // Direct Messages
        DM: 'dm',
        DM_ERROR: 'dm-error',
        DM_HISTORY: 'dm-history',
        GET_DM_HISTORY: 'get-dm-history',
        DM_USER_DISCONNECT: 'dm-user-disconnect',

        // Typing Indicators
        TYPING: 'typing',
        STOP_TYPING: 'stop-typing',
        USER_TYPING: 'user-typing',
        USER_STOP_TYPING: 'user-stop-typing',

        // User Status
        USER_STATUS: 'user-status',
        GET_ONLINE_USERS: 'get-online-users',
        ONLINE_USERS_LIST: 'online-users-list',

        // Testing
        TEST: 'test',
        TEST_REPLY: 'test-reply'
    },

    // HTTP Status Codes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        SERVER_ERROR: 500,
        SERVICE_UNAVAILABLE: 503
    },

    // User Roles
    USER_ROLES: {
        USER: 'user',
        ADMIN: 'admin'
    },

    // Mongoose Connection Options
    MONGOOSE_OPTIONS: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000
    },

    // Environment
    NODE_ENV: {
        DEVELOPMENT: 'development',
        PRODUCTION: 'production',
        TEST: 'test'
    }
};
