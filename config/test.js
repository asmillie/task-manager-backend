module.exports = {
    base_url: 'http://localhost',
    auth0: {
        domain: 'auth0.domain',
        clientId: 'auth0-clientId',
        clientSecret: 'auth0-clientSecret',
        namespace: 'https://example.com'
    },
    database: {
        uri: process.env.DATABASE_URI
    }
};
