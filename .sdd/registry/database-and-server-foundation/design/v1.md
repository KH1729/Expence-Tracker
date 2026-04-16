# Design: Database and server foundation

## Design Summary

The API lives under **`server/`** as a **TypeScript + Express** application using **`mysql2`** promise pool for MySQL access and **pino** for structured logs. Schema is delivered as a numbered SQL file under **`server/migrations/`** applied manually via documented **mysql CLI** (or any MySQL client). Configuration is validated at startup with **zod** from environment variables; missing required vars cause **exit code 1** with no secret leakage. The HTTP server **always binds** after config validation so **`GET /health`** can report **DB up/down**; a failed DB ping yields **HTTP 503** and the project’s **error JSON shape**. Primary key is **`BIGINT UNSIGNED AUTO_INCREMENT`** for simplicity and efficient indexing; application layers in later features use numeric IDs in API responses.

## Architecture Impact

- **Impact level:** low (greenfield `server/` only; no existing code to modify).
- **New components:** `server/` package, migration SQL, env validation module, DB pool module, health route, global error handler, Express app bootstrap.
- **Modified components:** none (repo root may gain `README.md` / `.gitignore` entries only).

## Components / Modules Affected

| Component | Change Type | Description |
|-----------|-------------|-------------|
| `server/src/config/loadEnv.ts` | new | Parse and validate env with zod; export typed config. |
| `server/src/db/pool.ts` | new | Create `mysql2` promise pool from config; export `getPool`, optional `pingDb()`. |
| `server/src/app.ts` | new | Express app: middleware order, mount `GET /health`, error handler last. |
| `server/src/index.ts` | new | Load env, create app, listen on `PORT`. |
| `server/src/routes/health.ts` | new | Async handler: ping DB, return 200 or 503 per contract. |
| `server/src/middleware/errorHandler.ts` | new | Central error → JSON `{ success: false, error: { code, message } }`. |
| `server/src/middleware/asyncHandler.ts` | new | Wrap async route handlers to forward errors to error handler. |
| `server/migrations/001_create_expenses.sql` | new | DDL for `expenses` table + index on `category`. |
| `.env.example` | new | Document variable names (no values for secrets). |

## Interfaces / APIs

### GET /health

- **Method:** `GET`
- **Path:** `/health`
- **Input:** none
- **Output (200 — DB reachable):**
  ```json
  {
    "success": true,
    "data": {
      "status": "ok",
      "db": "up"
    }
  }
  ```
- **Output (503 — DB unreachable or ping fails):**
  ```json
  {
    "success": false,
    "error": {
      "code": "SERVICE_UNAVAILABLE",
      "message": "Database unavailable"
    }
  }
  ```
- **Errors:** No stack traces or connection strings in body; log details at `error` level without passwords.

### Internal: MySQL pool

- **Input:** Env-driven host, port, user, password, database.
- **Output:** Pool used only by `health` (this feature) and later by expense repository.

## Data Flow

1. Process starts → `loadEnv()` validates required env → exit **1** if invalid.
2. `createPool()` registers MySQL pool (connections acquired on demand).
3. Express listens on **`PORT`** (default **4000** to avoid clashing with typical React dev **3000**).
4. `GET /health` → `pingDb()` (e.g. `pool.query('SELECT 1')`) → map result to **200** or **503** JSON above.

## Data Model / Schema Changes

| Entity | Change | Fields |
|--------|--------|--------|
| `expenses` | new | See DDL below |

### DDL (MySQL 8+)

```sql
CREATE TABLE IF NOT EXISTS expenses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(512) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(128) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3)),
  updated_at DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3)) ON UPDATE UTC_TIMESTAMP(3),
  INDEX idx_expenses_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Primary key decision:** **`BIGINT UNSIGNED AUTO_INCREMENT`** — native, compact, sufficient for single-app expense rows; avoids UUID string handling in SQL tools and keeps URLs numeric in later APIs. UUID remains available as a future additive column if needed.

**Timestamps:** `DATETIME(3)` with **UTC** defaults via `UTC_TIMESTAMP(3)` for consistent storage.

**Idempotency:** `CREATE TABLE IF NOT EXISTS` allows safe re-run in dev; destructive resets are manual (`DROP TABLE`) and out of scope.

### Migration workflow

- File: **`server/migrations/001_create_expenses.sql`**
- Document in **`server/README.md`**: `mysql -h … -u … -p … database_name < server/migrations/001_create_expenses.sql` (or equivalent).

## Security Considerations

- **Helmet** for default HTTP headers; **CORS** configured (allow local React origin in dev via env, e.g. `CORS_ORIGIN`, default `http://localhost:5173` for Vite).
- **Rate limiting** on all routes (e.g. `express-rate-limit`) with sensible defaults for dev.
- Env validation prevents silent misconfiguration; never log `MYSQL_PASSWORD` or DSN strings containing credentials.

## Observability Considerations

- **pino** logger: level from **`LOG_LEVEL`** (default `info`); request logging optional this phase (can add `pino-http` in implementation if task allows).
- Health is the primary probe for DB connectivity this phase.

## Testing Strategy

- **Unit tests:** `loadEnv` rejects missing vars; maps succeed with full fixture env.
- **Integration tests:** Supertest against app with **MSW not needed** — use test MySQL or **testcontainers** only if task budget allows; minimum **Supertest + mocked pool** for health 200/503 paths.
- **Edge cases:** missing env at startup (process exit); DB timeout (503).

## Rollout / Migration Notes

- Apply **`001_create_expenses.sql`** before first server run against a new database.
- No data backfill (new table).

## Risks / Tradeoffs

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| No Docker MySQL in repo | medium | onboarding friction | README documents local MySQL + env |
| Pool exhaustion later | low | medium | Tune `connectionLimit` in later perf work |

## Express middleware order

**cors** → **helmet** → **rateLimit** → **express.json()** → **routes** → **errorHandler** (not found → JSON 404 optional this phase; can return minimal JSON for unknown paths).

## Environment variables (final names)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MYSQL_HOST` | yes | — | MySQL host |
| `MYSQL_PORT` | no | `3306` | Port |
| `MYSQL_USER` | yes | — | User |
| `MYSQL_PASSWORD` | yes | — | Password |
| `MYSQL_DATABASE` | yes | — | Database name |
| `PORT` | no | `4000` | HTTP listen port |
| `LOG_LEVEL` | no | `info` | pino level |
| `CORS_ORIGIN` | no | `http://localhost:5173` | Allowed origin for CORS |

## Startup behavior (resolves spec edge case)

- **Missing env:** exit **1**, log safe reason (which key is missing, not values).
- **DB unreachable at startup:** server **still listens** (degraded mode); first **`GET /health`** returns **503** until DB is up. Rationale: operators can reach the process and health endpoint without guessing whether the app crashed vs DB only.
