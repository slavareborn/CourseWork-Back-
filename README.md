<!-- <p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

<!-- ## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Docker Usage

This project provides two Docker Compose configurations:

- **Development:** Uses the `docker-compose.yml` file with local volume mounts for live reloading.
  - **Start:**
    ```bash
    docker compose up
    ```

- **Production Testing:** Uses the `docker-compose.prod.yml` file without local volume mounts.
  - **Start:**
    ```bash
    docker compose -f docker-compose.prod.yml up
    ```

### Building and Rebuilding Images

- **Build Docker images:**
  ```bash
  docker compose build
  ```
- **Rebuild without cache:**
  If you've updated the Dockerfile or dependencies, rebuild the images without cache:
  ```bash
  docker compose build --no-cache
  ```

### Cleaning Up Resources

- **Stop containers and remove networks:**
  ```bash
  docker compose down
  ```
- **Full cleanup (including volumes):**
  Use this if you need to reset the environment completely:
  ```bash
  docker compose down --volumes
  ```

### Running Commands Inside the Container

You can run commands inside the running container using `docker compose exec`. For example, to run tests:

```bash
docker compose exec api npm run test
```

Alternatively, you can run a one-off command with:

```bash
docker compose run --rm api npm run test
```

### Additional Tips for Developers

- **Viewing Logs:**
  To follow logs of running containers:
  ```bash
  docker compose logs -f
  ```
- **Scaling Services:**
  You can scale a specific service if needed:
  ```bash
  docker compose up --scale <service_name>=<number_of_instances>
  ```
- **Troubleshooting:**
  If things aren't working as expected:
  - Try rebuilding images with the `--no-cache` option.
  - Check container logs with `docker compose logs -f`.

These instructions should help you quickly get started with Docker in this project.


## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE). --> -->

# Sniff Application

## Quick Description

The **Sniff Application** is a web-based system developed using TypeScript, Express, NestJS and PostgreSQL. It allows users to search for pets available for adoption, register as a user, and contact pet owners. The platform provides secure authentication and role-based access to manage profiles and listings.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [Directory Structure](#directory-structure)
- [Contribution Guidelines](#contribution-guidelines)
- [Branch Naming Conventions and Commit Message Guidelines](#branch-naming-conventions-and-commit-message-guidelines)

_Use [github-markdown-toc](https://github.com/ekalinin/github-markdown-toc) to automatically generate the Table of Contents._

---

## Prerequisites

Ensure the following tools and software are installed on your machine before setting up the project:

- [Node.js](https://nodejs.org/en/) (v20.11.0) you can see in .nvmrc file
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)
- [npm](https://www.npmjs.com/) for dependency management (v10.8.2)
- [NestJS](https://nestjs.com/)

---

# Installation Guide

Follow these steps to set up the project locally:

1. Clone the repository:

   ```bash
   git clone https://github.com/p1982/sniff-be.git
   cd sniff-be
   ```

2. Install dependencies:

`npm install`

3. Set up environment variables (see [Configuration](#configuration)).

4. Initialize the database and seed data:

`npm run seed`

5. Start the server:

`npm run dev`

# Configuration

You'll need to set up the following environment variables:

1. Create a .env file in the root directory of the project:

`touch .env`

2. Add the following environment variables:

`PORT=8000`
`HOST=localhost`
`DATABASE_URL=postgresql://username:password@localhost:5432/yourdatabase`
`SECRET_KEY=your_jwt_secret_key`

3. Alternatively, you can copy the example file and adjust it to your environment:

`cp .env.example .env`

# Running the Project

To run the project locally:

1. Start the development server:

`npm run dev`

2. Open the application at http://localhost:8000 in your browser or Postman.

# Testing

To run the test suite:

1. For unit tests:

`npm run test`

2. To run tests in watch mode:

`npm run test:watch`

# Directory Structure

A brief explanation of the most important folders in the project:

```
sniff-app/
│
├── src/                   # Source code for the application
    ├── animals/           # animals (routers, module services)
    ├── auth/              # auth (routers, module services)
    ├── config/            # Database configuration
    ├── middleware/        # role and auth middleware
    ├── repository/        # Database models
    └── user/              # user (routers, module services)
│
├── tests/                 # Test cases
    ├── unit/              # Unit tests
    └── integration/       # Integration tests
│
├── public/                # Public assets (images, static files)
├── docker/                # Docker-related configuration (e.g., Dockerfiles, docker-compose)
└── .env.example           # Example environment file
```

# Contribution Guidelines

We welcome contributions from the team! Follow these steps to work with the repository:

## Workflow:

1. **Create a new branch:**

   - Before starting your work, ensure your local `main` branch is up to date:

     ```bash
     git checkout main
     git pull origin main
     ```

   - Create a new branch from `main`:

     ```bash
     git checkout -b <branch-name>
     ```

   - The branch name should follow the [branch naming conventions](#branch-naming-convention).

2. **Make your changes:**

   - Make the necessary changes in your branch.
   - Once your changes are ready, commit them:
     ```bash
     git add .
     git commit -m "<commit-message>"
     ```
   - The commit message should follow the [commit naming conventions](#commit-naming-convention).

3. **Push your changes:**

   - Push your branch to the remote repository:
     ```bash
     git push origin <branch-name>
     ```

4. **Create a Pull Request:**

   - Once your branch is pushed, create a pull request (PR) to the `main` branch.
   - Be sure to assign reviewers from the team to review your PR.

5. **Address feedback:**
   - Address any feedback from the reviewers.
   - Once all feedback is resolved and approvals are obtained, the pull request can be merged.

---

## Branch Naming Convention:

- Use the following naming convention for branches:
  - `feature/<short-description>`: For new features
  - `bugfix/<short-description>`: For bug fixes
  - `hotfix/<short-description>`: For urgent fixes

Examples:

```bash
feature/add-user-authentication
bugfix/fix-login-issue
```

create migration examples
npm run migration:generate -- -d src/config/data-source.ts src/migrations/MakeAttributesNullable
