# Summary: design — database-and-server-foundation

## Phase

design

## What Was Produced

- Design artifact: `.sdd/workspace/database-and-server-foundation/current/design.md`
- **Express** app under **`server/`**, **mysql2** pool, **pino**, **zod** env validation, middleware order per project rules.
- **DDL** for `expenses` with **`BIGINT UNSIGNED AUTO_INCREMENT`** PK, **DECIMAL(10,2)** amount, **VARCHAR** description/category, **DATETIME(3)** UTC timestamps, **index on category**.
- **`GET /health`:** **200** + `{ success, data: { status, db: "up" } }` when DB OK; **503** + `{ success: false, error: { code, message } }` when DB down.
- **Startup:** fail fast on **missing env**; **listen even if DB down**; health reports **503** until DB available.
- **Migration:** `server/migrations/001_create_expenses.sql` + **server/README.md** instructions.
- **Env:** `MYSQL_*`, `PORT` default **4000**, `LOG_LEVEL`, `CORS_ORIGIN`.

## Key Decisions

1. Numeric **auto-increment** PK (not UUID) for simplicity.
2. Degraded startup: process up, **health** reflects DB.
3. Default HTTP **4000**, Vite-friendly **CORS** default **5173**.

## Risks / Open Issues

- Integration tests need MySQL or mocks — plan phase will task accordingly.

## What the Next Agent Must Know

- **Plan/tasks** should implement **`server/`** only; no React; wire **asyncHandler**, **errorHandler**, **rateLimit**, **helmet**, **cors**.
