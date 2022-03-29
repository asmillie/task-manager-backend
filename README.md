# Task Manager - Backend API

Backend API for a Todo List App

Built in NestJS + Express connecting to a MongoDB database. Authentication managed through [Auth0](https://auth0.com/).

View a live demo running on [Azure](https://task-manager-frontend-dev.azurewebsites.net/)

## Requirements

Run in a docker container or locally on your machine:

### **Docker**

Docker Build:
```
docker build -t task-manager-api:latest .
```
Docker Run:
```
docker run -e BASE_URL -e PORT -e DATABASE_URI -e AUTH0_DOMAIN -e AUTH0_CLIENT_ID -e AUTH0_CLIENT_SECRET -p 3000:3000 --name "task_manager-backend" -d task-manager-api:latest
```

### **Local**

- NodeJS 12.22.8
- MongoDB 5.0.4

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
