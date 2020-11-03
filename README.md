# Task Manager API

Create a user account and manage a personal list of tasks to be completed.

Built in NestJS + Express connecting to a MongoDB database. Uses the SendGrid Api for sending emails.

View a live demo running on [Heroku](https://asmillie-task-manager.herokuapp.com/)

## Requirements

Requires Node.js and a MongoDB database to connect to. SendGrid API is used for sending emails and requires an API key. To sign up for a free SendGrid account and get an API key go [here](https://sendgrid.com/).

## Installation

```bash
$ git clone https://github.com/asmillie/task-manager
```

## Configuration

Create a `config` folder in the main project directory. This folder will store a configuration file for each environment (ie. development, production).

Config files used by the app are `default.ts`, `development.ts`, `production.ts` and `test.ts`. The structure and required fields for each of these files is listed below.

`default.ts`
```bash
export default {
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
        uri: process.env.DATABASE_URI,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'jwtsecretpassword',
        expiresIn: process.env.JWT_EXPIRES_IN || 3600,
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000,
        maxRequestsPerWMS: 100,
    },
};
```

`development.ts` - (*Note: Please make sure to configure the fields to match your local setup.*)
```bash
export default {
    base_url: 'http://localhost',
    port: 3000,
    database: {
        uri: 'Enter your local MongoDB Uri here',
    },
    jwt: {
        secret: 'Enter your development secret password for JWT signing',
        expiresIn: 3600,
    },
    sendgrid: {
        key: 'Enter your sendgrid Api key here',
    },
};
```

`production.ts`
```bash
export default {
    base_url: process.env.BASE_URL,
    port: parseInt(process.env.PORT, 10),
    database: {
        uri: process.env.DATABASE_URI,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
    },
    sendgrid: {
        key: process.env.SENDGRID_API_KEY,
    },
};
```

`test.ts`
```bash
export default {
    base_url: 'http://localhost',
    sendgrid: {
        key: 'sendgrid-api-key',
    },
    jwt: {
        secret: 'test-jwt-secret',
        expiresIn: 3600,
    },
};
```

## Running the app

Once the configuration step has been completed and your MongoDB database is running it's time to run the app:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Documentation

```bash
# generate documentation
$ npx compodoc -p tsconfig.json -s

```
