export default {
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
        uri: process.env.DATABASE_URI,
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT, 10) || 27017,
        name: process.env.DATABASE_NAME || 'task-manager-api',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'defaultjwt11',
        expiresIn: process.env.JWT_EXPIRES_IN || 3600,
    },
};
