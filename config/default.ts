export default {
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
        uri: process.env.DATABASE_URI,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'defaultjwt11',
        expiresIn: process.env.JWT_EXPIRES_IN || 3600,
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000,
        maxRequestsPerWMS: 100,
    },
    recaptcha: {
        private_key: process.env.RECAPTCHA_PRIVATE_KEY,
    },
};
