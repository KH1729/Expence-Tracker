# Spec: Database and server foundation

## Background / Context

The **expense-tracker-web** project needs a reliable persistence layer and a TypeScript Node process that can connect to MySQL before building expense REST APIs and the React client. This feature establishes the `expenses` table, a repeatable way to apply schema to a database, and a minimal HTTP server with configuration and observability hooks.

## Problem Statement

Without an agreed schema and a running server that connects to MySQL using environment-based configuration, later features cannot implement CRUD, totals, or filtering safely or consistently.

## Goals

1. Define and version an **`expenses`** table suitable for downstream CRUD (description, amount, category as string, timestamps).
2. Provide a **repeatable migration or init-SQL** workflow so developers can create or update schema locally and in shared environments.
3. Deliver a **TypeScript Node HTTP server** skeleton (Express-compatible with project middleware expectations) that loads config from environment variables, uses a **MySQL connection pool**, and uses **structured logging** (not `console.log` in production code paths).
4. Expose **`GET /health`** returning a JSON body indicating liveness and, when practical, whether the database connection is usable (without leaking secrets).

## Non-Goals

- Expense CRUD routes, React UI, authentication, or category reference tables.
- Production deployment manifests, Docker, or CI pipelines (unless added in a later project decision).
- Pagination, filtering, or aggregation beyond what health might need internally.

## User Stories / Use Cases

### US-1: Developer runs migrations

**As a** developer, **I want to** apply the latest schema to my MySQL database, **so that** the app and future APIs have a consistent `expenses` table.

### US-2: Developer starts the server

**As a** developer, **I want to** start the API server with config from `.env`, **so that** it connects to MySQL and exposes a health check for smoke testing.

### US-3: Operator checks health

**As an** operator or developer, **I want to** call **`GET /health`**, **so that** I can verify the process and database connectivity without expense endpoints existing yet.

## Functional Requirements

### FR-1: Expenses table schema

- Table name: **`expenses`** (unless a documented prefix convention is introduced; default unprefixed).
- Columns (minimum):
  - **`id`**: `CHAR(36)` **UUID** string, primary key (generated in application layer on insert in later features), **or** `BINARY(16)` / `BIGINT` auto-increment — **design phase will choose one**; spec requires a **single primary key** and stable uniqueness.
  - **`description`**: string, **non-empty** at application layer in later phases; DB allows `VARCHAR` with a **reasonable max length** (e.g. 512–1024).
  - **`amount`**: **DECIMAL(10,2)** (or equivalent precision) for currency-scale values; **not** floating-point `DOUBLE` for money.
  - **`category`**: `VARCHAR` (e.g. 128) — free text for this feature; normalization deferred.
  - **`created_at`**, **`updated_at`**: `DATETIME(3)` or `TIMESTAMP` with UTC discipline documented in design.
- **Indexes**: primary key on `id`; **optional** index on `category` (recommended for later filtering).

### FR-2: Migrations / init SQL

- **At least one** committed SQL file (or migration step) that creates **`expenses`** idempotently or via a documented “first run” order (e.g. `001_init.sql`).
- README or server docs describe **how to run** migrations against a MySQL instance (CLI command or npm script).

### FR-3: Environment configuration

- Required variables (names illustrative; final names in design): database host, port, user, password, database name; optional **server port** for HTTP.
- **`.env.example`** lists all variables **without** real secrets; **`.env`** ignored by git.

### FR-4: HTTP server and health

- Server listens on configurable port (default e.g. **3000** or **4000** — fixed in design).
- **`GET /health`** returns JSON with a consistent success shape where applicable, e.g. `{ "success": true, "data": { "status": "ok", "db": "up" | "down" } }` (exact shape in design; errors must not expose credentials).

## Non-Functional Requirements

### NFR-1: Logging

- Use a **structured logger** (e.g. pino); log levels configurable via env; no passwords or connection strings in logs.

### NFR-2: Async safety

- Async route handlers use **try/catch** or **`asyncHandler`**; unhandled rejections must not crash the process silently.

### NFR-3: Security

- No secrets in source; validate env at startup where possible (fail fast with clear error messages).

## Constraints

- **Node.js** + **TypeScript**; **Express** (or equivalent) aligned with project middleware order when routes expand.
- **MySQL** 8.x or compatible; use parameterized queries / ORM in later features — this spec only requires **schema + pool** for connectivity proof.

## Assumptions

- Developers have MySQL credentials for local dev.
- Single currency; multi-currency is out of scope.

## Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| MySQL unreachable at startup | Server may start but `/health` reports DB **down**; or fail fast with clear log — **design chooses one** and documents it. |
| Missing env var | Process exits non-zero at startup with a safe message (no secret values printed). |
| Migration run twice | Documented behavior: idempotent script or manual drop/recreate for dev only. |

## Acceptance Criteria

- [ ] `expenses` table exists in MySQL after following documented migration steps.
- [ ] Server starts with valid `.env` and connects to the pool without errors in logs.
- [ ] `GET /health` returns **200** when app and DB are healthy; appropriate status when DB is down (e.g. **503** or **200** with `db: down` — **design** documents the contract).
- [ ] `.env.example` and `.gitignore` cover env files; no secrets in repo.
- [ ] No expense CRUD routes required for this feature.

## Open Questions

1. **UUID vs auto-increment** for `id` — resolved in **design** with rationale.
2. **Fail-fast vs degraded** when DB is down at startup — resolved in **design**.
