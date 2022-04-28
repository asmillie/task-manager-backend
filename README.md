# Task Manager - Backend API

## Overview

Allows a user to login (via [Auth0](https://auth0.com/)) and manage a list of tasks to be completed.

This repository contains the backend API for the app which is built on NestJS and connects to a MongoDB database. Authentication is managed through [Auth0](https://auth0.com/).

To view the frontend repository you can follow this [link](https://github.com/asmillie/task-manager-frontend).



<br>

## Live Demo

View a live demo running @ [https://task-manager-frontend-dev.azurewebsites.net/](https://task-manager-frontend-dev.azurewebsites.net/)

_Please note the app is currently deployed on the Azure free tier and may take a moment for the app to 'warm up'. Free tier services are 'parked' when not in continuous use to save on resources._

<br>

## Requirements

Build the project as a docker image through the included `Dockerfile` or run it in a NodeJS **v12.22.8** environment.

A MongoDB database is required to connect to, **v5.0.4** is the latest version used during development.

You will also need an [Auth0](https://auth0.com/) account as the app uses [Auth0](https://auth0.com/) for authenticating requests to the api. The basic free account is enough for testing or development purposes. 

*Please see the **Auth0 Setup**, **Configuration** and **Run the Project** sections below for detailed instructions on setup and deployment.*

<br>

## Installation

```bash
$ git clone https://github.com/asmillie/task-manager
```
<br>

## Auth0 Setup
As stated in the requirements an [Auth0](https://auth0.com/) account is required to run the project. The basic free account should be enough for testing or development purposes. For official documentation please see [https://auth0.com/docs](https://auth0.com/docs).

The following section will outline the steps to complete setup within the Auth0 dashboard before running the project:

1. Add an API to Applications
2. Add Custom Action to Actions Library
3. Attach Custom Action to Login Flow
4. Copy Auth0 Domain & Namespace for use in Configuration

### 1. Add an API to Applications

In the Auth0 Dashboard Sidebar under Applications -> APIs, click **Create API**. Enter a name for the API and set the **Identifier** as **task-manager** (all lowercase). Leave the **Signing Algorithm** as **RS256** and click **Create**.

### 2. Add Custom Action to Actions Library

Under Actions -> Library, click **Build Custom**. Enter name as **Add User Email to Token**, leave Trigger as **Login / Post Login** and Runtime as **Node 16**. Click **Create**.

You will be presented with the code editor where you can replace the existing code with the following code block. After entering the code click **Save Draft**.

```bash
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://example.com';
  const email = event.user.email;
  const email_verified = event.user.email_verified;

  if (event.authorization) {
    api.accessToken.setCustomClaim(`${namespace}/email`, email);
    api.accessToken.setCustomClaim(`${namespace}/email_verified`, email_verified);
  }
};
```
 _This code will attach a User's email and email verification status to the authorization token after the User has been authenticated by Auth0._

Note the namespace variable, you will need this during the **Configuration** phase. This is currently a placeholder value but could be assigned a different URL if preferred.

To complete this step Click **Deploy**.

### 3. Attach Custom Action to Login Flow

_Note: Please ensure that you deployed the action created in the previous step otherwise it will not show up in the Login Flow editor. You can deploy the action by navigating to Actions -> Library and under the Custom tab click on the **Add User Email to Token** action. Click **Deploy** in the upper right._

Navigate from the Sidebar to Actions -> Flows and choose **Login**.

From the panel on the right select the **Custom** tab. You should see the custom action created in the previous step labelled **Add User Email to Token**.

Drag and drop the **Add User Email to Token** action between the **Start** and **Complete** in the graph.

Click **Apply**.

### 4. Copy Auth0 Domain & Namespace to use in Configuration

As a final step copy your Auth0  **Domain** and **Namespace** for use in configuring the project. The **Namespace** was assigned during Step 2 of the Auth0 Setup (default value is **https://example.com**).

For the **Domain** here is what the official [Auth0 Documentation](https://auth0.com/docs) says (tenant is your account/user name):

>**Find Your Auth0 Domain**
>
>If your Auth0 domain is your tenant name, your regional subdomain (unless your tenant is in the US region and was created before June 2020), plus .auth0.com. For example, if your tenant name were travel0, your Auth0 domain name would be travel0.us.auth0.com. (If your tenant were in the US and created before June 2020, then your domain name would be https://travel0.auth0.com.)
>
>If you are using custom domains, this should be your custom domain name.


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
# Example: mongodb://127.0.0.1:27017/task-manager-api
export DATABASE_URI=<Replace with MongoDB URI>

# Auth0
export AUTH0_DOMAIN=<Replace with Auth0 Domain>
export AUTH0_NAMESPACE=<Replace with Auth0 Namespace>
```

### **Development**
In development mode you can provide environment variables by creating a `dev.env` file in the root directory.

`dev.env`
```
BASE_URL=http://localhost
PORT=3000
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX_REQ_PER_WMS=100
DATABASE_URI=<Replace with MongoDB URI>
AUTH0_DOMAIN=<Replace with Auth0 Domain>
AUTH0_NAMESPACE=<Replace with Auth0 Namespace>
```

<br>

## Run the Project

After completing Auth0 Setup and configuration the project is ready to run.

### **Docker**
```bash
# Build Project
npm run build

# Build Docker Image
docker build -t task-manager-api:latest .

# Run in Docker Container on Port 3000
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

## Run Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

<br>

## Documentation

```bash
# generate documentation
$ npx compodoc -p tsconfig.json -s

```

