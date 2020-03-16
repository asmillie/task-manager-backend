export default {
    base_url: 'http://localhost/',
    port: 3000,
    database: {
        uri: 'mongodb+srv://taskapp:eBdlFPPgP8X9FRij@cluster0-opwul.mongodb.net/task-api?retryWrites=true',
        // 'mongodb://127.0.0.1:27017/task-manager-api',
    },
    jwt: {
        secret: 'developmentsecret32',
        expiresIn: 3600,
    },
    sendgrid: {
        key: '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',
    },
};
