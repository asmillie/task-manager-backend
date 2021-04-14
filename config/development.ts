export default {
    base_url: 'http://localhost',
    port: 3000,
    database: {
        uri: 'mongodb://127.0.0.1:27017/task-manager-api',
    },
    jwt: {
        secret: 'developmentsecret32',
        expiresIn: 3600,
    },
    recaptcha: {
        private_key: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe', // Google Test Key, Always Passes
    },
};
