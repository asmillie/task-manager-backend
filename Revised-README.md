# Task Manager - Backend API

## Overview

Allows a user to login (via [Auth0](https://auth0.com/)) and manage a list of tasks to be completed.

This repository contains the backend API for the app which is built on NestJS and connects to a MongoDB database. Authentication is managed through [Auth0](https://auth0.com/).

To view the frontend repository you can follow this [link](https://github.com/asmillie/task-manager-frontend).

View a live demo running @ [https://task-manager-frontend-dev.azurewebsites.net/](https://task-manager-frontend-dev.azurewebsites.net/)

## Requirements

Build the project as a docker image through the included `Dockerfile` or run it in a NodeJS **v12.22.8** environment.

A MongoDB database is required to connect to, **v5.0.4** is the latest version used during development.

You will also need an [Auth0](https://auth0.com/) account as the app uses [Auth0](https://auth0.com/) for authenticating requests to the api.

*Please see the **Configuration** and **Run the Project** sections below for detailed instructions on setup and deployment.* 

## Installation

```bash
$ git clone https://github.com/asmillie/task-manager
```

## Run the Project

### **Docker**
```bash
# Build Project
npm run build

# Build Docker Image
docker build -t task-manager-api:latest .

# Run in Docker Container (defaults to Port 3000)
docker run -e BASE_URL -e PORT -e DATABASE_URI -e AUTH0_DOMAIN -e AUTH0_CLIENT_ID -e AUTH0_CLIENT_SECRET -p 3000:3000 --name "task_manager-backend" -d task-manager-api:latest
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

