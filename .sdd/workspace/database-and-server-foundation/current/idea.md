# Idea: Database and server foundation

## Raw Request

Project approval: build an **expense tracker web app** with **Node.js + TypeScript** server, **React + TypeScript** client, **MySQL** database. Full CRUD for expenses (description, amount, category), list + running total, filter by category — to be delivered across ordered features. This feature is the **first** slice: **database schema and HTTP server foundation** only.

## Normalized Summary

Establish the persistence layer and a minimal TypeScript Node HTTP server that connects to MySQL, defines the `expenses` table (and supporting migration or init SQL), and exposes no business REST surface yet beyond what is needed to prove the stack (e.g. health or DB ping). Downstream features will add the expense API and the React UI.

## Initial Scope

- MySQL schema for **expenses** with at least: primary key, **description**, **amount**, **category**, and audit timestamps as appropriate.
- Versioned or repeatable **migration/init** path (e.g. SQL migration files or documented init script) checked into the repo.
- **Node.js + TypeScript** server package: build/dev scripts, `tsconfig`, entrypoint, structured logging (no `console.log` in production paths per project rules).
- **MySQL** connectivity (connection pool or equivalent), configuration via **environment variables** (e.g. host, port, user, password, database name) — no secrets hardcoded.
- Optional: simple **health** route (e.g. `GET /health`) confirming process is up; optional DB connectivity check if low-risk.
- Repository layout compatible with a separate **React** client later (e.g. `server/` at repo root or documented structure).

## Out of Scope

- REST CRUD endpoints for expenses (dedicated follow-on feature).
- React UI, authentication, or authorization.
- Category master table or enums beyond storing **category as a string** on the expense row (can be revisited in spec if needed).
- Docker Compose, production deployment, or CI/CD (unless explicitly added later).
- Pagination, filtering, or aggregation APIs (later features).

## Assumptions

- MySQL 8.x or compatible is available locally or via connection string for development.
- Single currency; **amount** stored in a DECIMAL-compatible column; application will treat money carefully in later phases.
- Monorepo or single repo with `server/` (and later `client/`) is acceptable unless the team chooses otherwise in spec.

## Constraints

- Stack: **TypeScript** on server; **Express** (or equivalent) patterns must follow project rules: async handling, validation where applicable, middleware order when routers are introduced.
- **Zod** for request validation when routes exist (this phase may have no validated body yet).
- No secrets in source control; use `.env` / `.env.example` patterns.

## Human Approval Status

- [x] Idea reviewed by human developer
- [x] Scope confirmed
- [x] Ready to proceed to Spec phase
