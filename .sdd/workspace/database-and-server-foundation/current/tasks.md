# Tasks: Database and server foundation

## Task List

### T-001: Scaffold `server/` TypeScript package

- **Scope:** Create `server/package.json` with `express`, `mysql2`, `pino`, `zod`, `cors`, `helmet`, `express-rate-limit`, devDependencies `typescript`, `tsx` or `ts-node`, `@types/*`, `vitest`, `supertest`, `@types/supertest`. Add `tsconfig.json` (strict), scripts: `dev`, `build`, `start`, `test`. Add minimal `src/` placeholder if needed for compile.
- **Inputs:** `design.md` component list.
- **Dependencies:** none
- **Expected Output:** Installable package; `npm run build` succeeds (empty or stub `index.ts` ok until later tasks complete wiring).
- **Definition of Done:** `cd server && npm install && npm run build` exits 0.
- **Validation Notes:** No secrets in repo; scripts align with implementation.

### T-002: Migration SQL and migration README

- **Scope:** Add `server/migrations/001_create_expenses.sql` exactly per `design.md` DDL. Add `server/README.md` with prerequisites (MySQL 8+), how to create database, and example `mysql` CLI one-liner to apply migration.
- **Inputs:** `design.md` DDL section.
- **Dependencies:** T-001
- **Expected Output:** SQL file + README section.
- **Definition of Done:** SQL matches design; instructions are copy-pasteable placeholders (`<user>`, `<database>`).
- **Validation Notes:** `CREATE TABLE IF NOT EXISTS` idempotency stated.

### T-003: Environment loading and `.env.example`

- **Scope:** Implement `server/src/config/loadEnv.ts` with zod schema for all vars in design table; export typed config. Fail process with exit code 1 and safe log when validation fails. Add `server/.env.example` (or repo root `.env.example` if monorepo convention — **use `server/.env.example`**). Ensure `.gitignore` includes `.env` (root or `server/`).
- **Inputs:** `design.md` env table.
- **Dependencies:** T-001
- **Expected Output:** `loadEnv()` + example env file + gitignore update.
- **Definition of Done:** Unit test: missing required var causes thrown error or exit path; success path returns typed object.
- **Validation Notes:** No password values in logs on failure.

### T-004: MySQL pool and ping

- **Scope:** `server/src/db/pool.ts` — create `mysql2/promise` pool from config; export `getPool()` and `pingDb()` using `SELECT 1` or `pool.query`.
- **Inputs:** T-003 config shape.
- **Dependencies:** T-003
- **Expected Output:** Pool module with tests using **mocked** mysql2 if no DB (injectable factory) or integration test gated by env.
- **Definition of Done:** `pingDb` resolves true when query succeeds; false or throws on failure per handler needs — **health** will catch and return 503.
- **Validation Notes:** No connection string in logs.

### T-005: Express app, middleware, health route

- **Scope:** `server/src/middleware/asyncHandler.ts`, `errorHandler.ts` (JSON error shape per project rules), `server/src/app.ts` with order: cors → helmet → rateLimit → express.json() → routes → errorHandler. `server/src/routes/health.ts`: `GET /health` → ping → 200 vs 503 bodies per design. `server/src/index.ts` calls `loadEnv`, `createApp`, `listen(PORT)`. Wire **pino** logger (child logger per request optional; minimum global logger).
- **Inputs:** `design.md` health contract and middleware order.
- **Dependencies:** T-004
- **Expected Output:** Running server; manual curl shows correct JSON.
- **Definition of Done:** Supertest: health returns 200 when pool mocked to succeed; 503 when ping fails.
- **Validation Notes:** Async routes wrapped; no unhandled rejections.

### T-006: Vitest tests — health and error handler

- **Scope:** Expand tests: `loadEnv` edge cases; health 200/503 with mocked `pingDb`; optional 404 JSON for unknown route (if implemented in design — **minimal 404** optional). Keep files under **250 lines**; split test files if needed.
- **Inputs:** Prior tasks.
- **Dependencies:** T-005
- **Expected Output:** `npm test` passes without live MySQL (mocks).
- **Definition of Done:** Coverage on critical paths; no flaky timing.
- **Validation Notes:** Arrange / Act / Assert structure.

### T-007: Documentation and repo hygiene

- **Scope:** Root `README.md` (or extend `server/README.md`) — how to run migrations, env vars, `npm run dev`, smoke `/health`. Confirm `.env` gitignored. No TODOs left in code.
- **Inputs:** All prior outputs.
- **Dependencies:** T-006
- **Expected Output:** Short developer onboarding for this feature only.
- **Definition of Done:** New developer can follow steps without asking.
- **Validation Notes:** Links/paths match actual files.
