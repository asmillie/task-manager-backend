module.exports = {
    base_url: 'http://localhost',
    port: 3000,
    database: {
        uri: 'mongodb://127.0.0.1:27017/task-manager-api',
    },
    auth0: {
        domain: 'dev-x4xgby3m.us.auth0.com',
        clientId: 'mjdMD5l2N6ULDkJXry3irrhKeBaoDS0v',
        clientSecret: process.env.AUTH0_CLIENT_SECRET
    }
};
