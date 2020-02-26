export default {
    port: parseInt(process.env.PORT, 10),
    database: {
        uri: process.env.DATABASE_URI,
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT, 10),
        name: process.env.DATABASE_NAME,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
    },
};
