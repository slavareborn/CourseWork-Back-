# Doctor's Site Backend

## Quick Description

The **Doctor's Site** is a web-based system developed using TypeScript, NestJS and PostgreSQL. This application will allow users to search for doctors in hospitals in the cities, but now users can signin or signup to our site.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)

---

## Prerequisites

Ensure the following tools and software are installed on your machine before setting up the project:

- [Node.js](https://nodejs.org/en/) (v20.11.0) you can see in .nvmrc file
- [PostgreSQL](https://www.postgresql.org/)
- [npm](https://www.npmjs.com/) for dependency management (v10.8.2)
- [NestJS](https://nestjs.com/)

---

# Installation Guide

Follow these steps to set up the project locally:

1. Clone the repository:

   ```bash
   git clone https://github.com/slavareborn/CourseWork-Back-.git
   cd CourseWork-Back
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

2. Open the application at http://localhost:8000.