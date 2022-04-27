# Task Manager - Backend API

## Overview

Allows a user to login (via [Auth0](https://auth0.com/)) and manage a list of tasks to be completed.

This repository contains the backend API for the app which is built on NestJS and connects to a MongoDB database. Authentication is managed through [Auth0](https://auth0.com/).

To view the frontend repository you can follow this [link](https://github.com/asmillie/task-manager-frontend).

View a live demo running @ [https://task-manager-frontend-dev.azurewebsites.net/](https://task-manager-frontend-dev.azurewebsites.net/)

<br>

## Requirements

Build the project as a docker image through the included `Dockerfile` or run it in a NodeJS **v12.22.8** environment.

A MongoDB database is required to connect to, **v5.0.4** is the latest version used during development.

You will also need an [Auth0](https://auth0.com/) account as the app uses [Auth0](https://auth0.com/) for authenticating requests to the api. The basic free account is enough for testing or development purposes. 

*Please see the **Configuration** and **Run the Project** sections below for detailed instructions on setup and deployment.* 

<br>

## Auth0 Setup
As stated in the requirements an [Auth0](https://auth0.com/) account is required to run the project. The basic free account should be enough for testing or development purposes. For official documentation please see [https://auth0.com/docs](https://auth0.com/docs).

The following section will outline the steps to complete setup within the Auth0 dashboard before running the project:

1. Add an API to Applications
2. Add Custom Action to Actions Library
3. Attach Custom Action to Login Flow
4. Copy Auth0 Domain & Namespace to use in Configuration

### Add an API to Applications

In the Auth0 Dashboard under Applications -> APIs, click **Create API**. Enter a name for the API and set the **Identifier** as **task-manager** (all lowercase). Leave the **Signing Algorithm** as **RS256** and click **Create**.



<br>

## Installation

```bash
$ git clone https://github.com/asmillie/task-manager
```
<br>

## Configuration
### **Docker / Production**
When running in a docker container or in production mode you will need to provide the following environment variables:

```bash
export BASE_URL=http://localhost
export PORT=3000

# API Rate Limits
export API_RATE_LIMIT_WINDOW_MS=900000
export API_RATE_LIMIT_MAX_REQ_PER_WMS=100

# MongoDB Connection URI
export DATABASE_URI=<Insert MongoDB URI>

# Auth0 
export AUTH0_DOMAIN=
export AUTH0_NAMESPACE=
```

### **Development**
In development mode you can provide environment variables by creating a `dev.env` file in the root directory.

`dev.env`
```
BASE_URL=http://localhost
PORT=3000
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX_REQ_PER_WMS=100
DATABASE_URI=
AUTH0_DOMAIN=
AUTH0_NAMESPACE=
```

<br>

## Run the Project

### **Docker**
```bash
# Build Project
npm run build

# Build Docker Image
docker build -t task-manager-api:latest .

# Run in Docker Container (defaults to Port 3000)
docker run -e BASE_URL -e PORT -e DATABASE_URI -e AUTH0_DOMAIN -p 3000:3000 --name "task_manager-backend" -d task-manager-api:latest
```

### **NodeJS Environment**
```bash
# Install NPM Packages
npm i

# Run in Development Mode
npm run start:dev

# Run in Production Mode
npm run start:prod
```

<br>

