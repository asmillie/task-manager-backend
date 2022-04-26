# Task Manager - Backend API

Allows a user to login (via [Auth0](https://auth0.com/)) and manage a list of tasks to be completed.

This repository contains the backend API for the app which is built on NestJS and connects to a MongoDB database. Authentication is managed through [Auth0](https://auth0.com/).

To view the frontend repository you can follow this [link](https://github.com/asmillie/task-manager-frontend).

View a live demo running @ [https://task-manager-frontend-dev.azurewebsites.net/](https://task-manager-frontend-dev.azurewebsites.net/)

## Requirements

The project can be run via [Docker](https://www.docker.com/) or in a NodeJs 12 environment. You must provide a MongoDB database to connect to and will also need an [Auth0](https://auth0.com/) account. 

- MongoDB 5.0.4
- NodeJS 12.22.8

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
