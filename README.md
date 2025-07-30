<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>


# NestJS Practical Project

This is a practical NestJS backend project designed as a full-featured blog platform. It demonstrates the use of NestJS framework along with TypeORM, Swagger, and other modern technologies to build a scalable and maintainable server-side application.

## Features

- **User Management:** Registration, profile management, and user status handling.
- **Authentication:** Secure authentication with support for Google OAuth strategy.
- **Blog Management:** Create, update, and manage blog posts with status control.
- **Category Management:** Organize blogs into categories.
- **Comments:** Users can comment on blog posts.
- **Image Handling:** Upload and manage images associated with blogs or profiles.
- **HTTP Services:** Custom HTTP services such as SMS integration.
- **API Documentation:** Integrated Swagger UI for API exploration and testing.

## Technologies Used

- [NestJS](https://nestjs.com/) - A progressive Node.js framework for building efficient and scalable server-side applications.
- [TypeORM](https://typeorm.io/) - ORM for TypeScript and JavaScript (ES7, ES6, ES5).
- [Swagger](https://swagger.io/) - API documentation and testing.
- [Cookie-Parser](https://www.npmjs.com/package/cookie-parser) - Middleware for handling cookies.
- [ValidationPipe](https://docs.nestjs.com/techniques/validation) - For request validation.
- Google OAuth Strategy for authentication.

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure the necessary environment variables, including:
   - `PORT` (optional, default is 3000)
   - `SECRET_COOKIE_PARSER` (secret key for cookie parser)
   - Database connection variables as per `src/configs/typeorm.config.ts`
   - Google OAuth credentials for authentication

4. Set up your database according to the TypeORM configuration.

## Running the Application

Start the server with:

```bash
npm run start
```

By default, the server listens on port 3000 or the port specified in the `.env` file.

Static assets are served from the `public` directory.

## API Documentation

Swagger UI is available at:

```
http://localhost:<PORT>/swagger
```

Use this interface to explore and test the API endpoints.

## Project Structure Overview

- `src/main.ts` - Application entry point.
- `src/modules/app/app.module.ts` - Main application module importing all feature modules.
- `src/modules/user/` - User management module.
- `src/modules/auth/` - Authentication module including Google OAuth strategy.
- `src/modules/blog/` - Blog post management.
- `src/modules/category/` - Blog categories.
- `src/modules/comment/` - Commenting system.
- `src/modules/image/` - Image upload and management.
- `src/modules/http/` - Custom HTTP services like SMS.
- `src/common/` - Shared utilities, decorators, interceptors, and types.
- `src/configs/` - Configuration files including Swagger and TypeORM.

## Contact

This project is maintained by [Reza Hadipour].

- GitHub: [Your GitHub Profile](https://github.com/reza-hadipour)
- LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/rhadipour/)

---

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