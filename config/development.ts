export default {
    port: 3000,
    database: {
        uri: 'mongodb://127.0.0.1:27017/task-manager-api',
        host: '127.0.0.1',
        port: 27017,
        name: 'task-manager-api',
    },
    jwt: {
        secret: 'developmentsecret32',
        expiresIn: 3600,
    },
};
