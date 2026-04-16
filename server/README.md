# Expense tracker API (server)

Node.js + TypeScript + Express + MySQL (`mysql2`). This package provides the HTTP API for **expense-tracker-web**.

## Prerequisites

- **Node.js** 20+
- **MySQL** 8.x (or compatible)

## Configuration

1. Copy `.env.example` to `.env` in this directory.
2. Set `MYSQL_*` and optional `PORT`, `LOG_LEVEL`, `CORS_ORIGIN`.

Never commit `.env`.

## Database migration

Create an empty database (example name `expense_tracker`), then apply the schema:

```bash
mysql -h 127.0.0.1 -P 3306 -u YOUR_USER -p YOUR_DATABASE < migrations/001_create_expenses.sql
```

The script uses `CREATE TABLE IF NOT EXISTS`, so it is safe to re-run in development when you only need to ensure the table exists.

## Scripts

| Command   | Description                |
|----------|----------------------------|
| `npm run dev`   | Dev server with reload (`tsx`) |
| `npm run build` | Compile TypeScript to `dist/`  |
| `npm start`     | Run compiled `dist/index.js`   |
| `npm test`      | Vitest test run                |

Default HTTP port is **4000** (`PORT`).

## Health check

- `GET /health` — returns `200` with `db: up` when MySQL is reachable, or `503` when the database ping fails.

## Expense API (CRUD)

**Security (MVP):** these routes do **not** enforce authentication. Only use on trusted networks or behind a gateway until auth is added.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/expenses` | List expenses (`limit` 1–100 default 20, `offset` ≥0 default 0). Response: `{ success, data: { items, total } }`. |
| `GET` | `/api/expenses/:id` | Get one expense by numeric id. |
| `POST` | `/api/expenses` | Create. Body: `{ description, amount, category }`. `amount` is a positive number or string with at most 2 decimal places. Response **201**. |
| `PATCH` | `/api/expenses/:id` | Partial update; body must include at least one of `description`, `amount`, `category`. |
| `DELETE` | `/api/expenses/:id` | Delete. Response **204** with no body on success. |

**Example create (JSON):**

```json
{
  "description": "Coffee",
  "amount": "4.50",
  "category": "Food"
}
```

**Success shape:** `{ "success": true, "data": { ... } }`. **Error shape:** `{ "success": false, "error": { "code", "message" } }` (e.g. `VALIDATION_ERROR`, `NOT_FOUND`).
