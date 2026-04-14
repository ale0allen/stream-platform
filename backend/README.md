# Stream Platform Backend

Spring Boot backend for the local MVP stack.

## Stack

- Java 21
- Spring Boot 3
- Maven
- PostgreSQL
- Flyway
- JWT auth

## Required Environment Variables

Copy values from [.env.example](/C:/Users/ale_a/projeto/copiaStreamaker/stream-platform/backend/.env.example) into your shell, IDE run configuration, or terminal session.

- `APP_PORT`
  Default: `8080`
- `DB_URL`
  Default: `jdbc:postgresql://localhost:5432/stream_platform`
- `DB_USERNAME`
  Default: `postgres`
- `DB_PASSWORD`
  Default: `postgres`
- `JWT_SECRET`
  Base64 secret used to sign JWTs
- `JWT_EXPIRATION_MINUTES`
  Default: `1440`
- `FRONTEND_URLS`
  Comma-separated local frontend origins allowed by CORS
  Default: `http://localhost:5173,http://127.0.0.1:5173`
- `SPRING_PROFILES_ACTIVE`
  Use `dev` to load local seed data
  Use `embedded,dev` if you also want embedded PostgreSQL for local validation

## Local Setup

1. Install Java 21, Maven, and PostgreSQL.
2. Create a PostgreSQL database named `stream_platform`.
3. Use the values from `.env.example`.
4. Start the backend from the `backend` directory:

```bash
mvn spring-boot:run
```

## Build

```bash
mvn clean package
```

## Optional Local Validation

If you do not have PostgreSQL running locally, you can start the packaged app with the embedded validation profile:

```bash
java -Dspring.profiles.active=embedded -jar target/stream-platform-backend-0.0.1-SNAPSHOT.jar
```

This is only for local validation. The default developer path remains PostgreSQL.

## Development Seed Data

Local seed data is only loaded when the `dev` Spring profile is active.

Default credentials:

- Admin
  Email: `admin@streamplatform.local`
  Password: `admin12345`
- User
  Email: `luna@streamplatform.local`
  Password: `user12345`
- User
  Email: `pixel@streamplatform.local`
  Password: `user12345`

Seed content:

- 1 admin user
- 2 regular users
- sample profiles for all seeded accounts
- sample favorites linking the seeded profiles

## Local Frontend Integration

- Default frontend URL: `http://localhost:5173`
- Default backend API base URL expected by the frontend: `http://localhost:8080/api`
- CORS is controlled by `FRONTEND_URLS`

## Main API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- `GET /api/profiles/me`
- `PUT /api/profiles/me`
- `GET /api/profiles?q=<search>`
- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/{profileId}`
- `GET /api/admin/ping`
- `GET /api/admin/users`
