export default {
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
        uri: process.env.DATABASE_URI,
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000,
        maxRequestsPerWMS: 100,
    },
};
