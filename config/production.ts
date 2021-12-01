export default {
    base_url: process.env.BASE_URL,
    port: parseInt(process.env.PORT, 10),
    database: {
        uri: process.env.DATABASE_URI,
    },
    auth0: {
        domain: process.env.AUTH0_DOMAIN,
        clientId: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET
    }
};
