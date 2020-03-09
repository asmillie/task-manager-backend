export default {
    port: parseInt(process.env.PORT, 10),
    database: {
        uri: process.env.DATABASE_URI,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
    },
};
