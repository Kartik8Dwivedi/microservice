# Microservice Boilerplate

A production-minded Node.js + Express + MongoDB microservice boilerplate following
a clean, layered architecture.

## Architecture

Requests flow through clearly separated layers, each with one responsibility:

```
Route → Validator (Zod) → Controller (functional) → Service (class) → Repository (class) → Model (Mongoose)
```

- **Routes** — wire HTTP verbs/paths to controllers; attach validation middleware.
- **Controllers** _(functional)_ — thin HTTP adapters: read the validated request,
  call a service, send a standardised response. No business logic, no try/catch.
- **Services** _(class)_ — framework-agnostic business logic & domain rules.
  Depend on repositories, never on Express or Mongoose directly.
- **Repositories** _(class)_ — the only layer that touches the database. A generic
  `CrudRepository` base class provides CRUD; concrete repositories extend it.
- **Models** — Mongoose schemas.

> **Why classes for service/repository and functions for controllers?**
> Services and repositories benefit from instance state and inheritance — e.g.
> `ResourceRepository extends CrudRepository` reuses CRUD, and dependency
> injection via the constructor makes them trivial to unit-test with mocks.
> Controllers are stateless request→response adapters, so plain functions keep
> them simple and tree-shakeable. This is the convention used by most mature
> Node back ends.

## Project structure

```
src/
├── app.js                 # Express app factory (no listen — testable)
├── index.js               # Bootstrap: DB connect, listen, graceful shutdown
├── Config/                # Env validation, DB, logger, rate limiter
├── Controllers/           # Functional request handlers
├── Middlewares/           # asyncHandler, validate, errorHandler, notFound
├── Models/                # Mongoose schemas
├── Repository/            # CrudRepository (base) + concrete repositories
├── Routes/                # /api → /v1 → feature routers
├── Services/              # Business logic (classes)
├── Utils/                 # AppError hierarchy, ApiResponse
└── Validators/            # Zod request schemas
```

## Getting started

```bash
npm install
cp .sample.env .env       # then edit values
npm run dev               # nodemon, hot reload
npm start                 # production
```

## Scripts

| Script                 | Description                     |
| ---------------------- | ------------------------------- |
| `npm run dev`          | Start with nodemon (hot reload) |
| `npm start`            | Start the server                |
| `npm run lint`         | Lint with ESLint                |
| `npm run lint:fix`     | Lint and auto-fix               |
| `npm run format`       | Format with Prettier            |
| `npm run format:check` | Check formatting                |

## Environment variables

| Variable      | Required | Default       | Description                             |
| ------------- | -------- | ------------- | --------------------------------------- |
| `NODE_ENV`    | no       | `development` | `development` \| `test` \| `production` |
| `PORT`        | no       | `3001`        | HTTP port                               |
| `MONGO_URI`   | **yes**  | —             | MongoDB connection string               |
| `CORS_ORIGIN` | no       | `*`           | Comma-separated allowed origins, or `*` |

Env vars are validated at startup (Zod) — the process exits with a clear message
if anything is missing or invalid.

## Example API (Resource)

`Resource` is a neutral placeholder entity. Copy the `*.model.js`,
`*.repository.js`, `*.service.js`, `*.controller.js`, `*.routes.js`, and
`*.validator.js` files, rename, and adapt to your domain.

| Method   | Path                    | Description      |
| -------- | ----------------------- | ---------------- |
| `GET`    | `/health`               | Liveness probe   |
| `GET`    | `/api/v1/resources`     | List (paginated) |
| `POST`   | `/api/v1/resources`     | Create           |
| `GET`    | `/api/v1/resources/:id` | Get by id        |
| `PATCH`  | `/api/v1/resources/:id` | Update           |
| `DELETE` | `/api/v1/resources/:id` | Delete           |

### Response envelope

Success:

```json
{
  "success": true,
  "message": "Resources fetched",
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 1 }
}
```

Error (produced centrally by the error handler):

```json
{
  "success": false,
  "message": "Request validation failed",
  "details": [{ "source": "body", "path": "name", "message": "..." }]
}
```

## Adding a new feature

1. `Models/<entity>.model.js` — define the schema.
2. `Repository/<entity>.repository.js` — `extends CrudRepository`.
3. `Services/<entity>.service.js` — business logic.
4. `Validators/<entity>.validator.js` — Zod schemas.
5. `Controllers/<entity>.controller.js` — functional handlers.
6. `Routes/v1/<entity>.routes.js` — wire it up, mount in `Routes/v1/index.js`.

## Suggested next steps

- **Testing**: Vitest/Jest + Supertest (the app factory makes this easy).
- **API docs**: OpenAPI/Swagger generated from the Zod schemas.
- **Auth**: JWT middleware + role guards.
- **Containerisation**: `Dockerfile` + `docker-compose` (app + MongoDB).
- **CI**: GitHub Actions running `lint` + `format:check` + tests.
- **Observability**: structured JSON logs (pino) + request IDs + `/metrics`.
