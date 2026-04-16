# Expense tracker API (server)

Node.js + TypeScript + Express + MySQL (`mysql2`). This package provides the HTTP API for **expense-tracker-web**.

## Prerequisites

- **Node.js** 20+
- **MySQL** 8.x (or compatible)

## Configuration

1. Copy `.env.example` to `.env` in this directory.
2. Set `MYSQL_*` and optional `PORT`, `LOG_LEVEL`, `CORS_ORIGIN` (**must match** the web app origin, e.g. `http://localhost:3000` for Next.js dev).

Never commit `.env`.

## Database migration

Create an empty database (example name `expense_tracker`), then apply the schema:

```bash
mysql -h 127.0.0.1 -P 3306 -u YOUR_USER -p YOUR_DATABASE < migrations/001_create_expenses.sql
mysql -h 127.0.0.1 -P 3306 -u YOUR_USER -p YOUR_DATABASE < migrations/002_categories_and_expense_fk.sql
```

Apply **`001`** before **`002`**. Migration **`002`** adds the **`categories`** table, backfills from legacy **`expenses.category`**, adds **`category_id`**, and drops the old **`category`** column.

## Scripts

| Command   | Description                |
|----------|----------------------------|
| `npm run dev`   | Dev server with reload (`tsx`) |
| `npm run build` | Compile TypeScript to `dist/`  |
| `npm start`     | Run compiled `dist/index.js`   |
| `npm test`      | Vitest test run                |
| `npm run db:seed` | Insert mock expenses when `expenses` is empty (uses `.env`) |

Default HTTP port is **4000** (`PORT`).

## Request logging (debugging)

Each HTTP request is logged with **pino** + **pino-http**: method, URL, status code, response time, and a per-request id. **`GET /health` is not logged** so health probes do not flood the logs. Bodies and `Authorization` are not logged.

## Mock data (database)

After migrations, populate sample rows for local UI/API testing:

```bash
npm run db:seed
```

This inserts several expenses **only if the `expenses` table is empty**. To run again from scratch, truncate the table in MySQL (dev only), then re-run the command.

## Health check

- `GET /health` — returns `200` with `db: up` when MySQL is reachable, or `503` when the database ping fails.

## Categories API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/categories` | List categories. Response: `{ success, data: { items: Category[] } }` ordered by name. |
| `POST` | `/api/categories` | Create. Body: `{ name }`. Response **201** `{ data: { category } }`. Duplicate name (case-insensitive) → **409** `DUPLICATE_CATEGORY`. |

## Expense API (CRUD)

**Security (MVP):** these routes do **not** enforce authentication. Only use on trusted networks or behind a gateway until auth is added.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/expenses` | List expenses (`limit` 1–100 default 20, `offset` ≥0 default 0). Each item includes **`category: { id, name }`**. Response: `{ success, data: { items, total } }`. |
| `GET` | `/api/expenses/:id` | Get one expense by numeric id. |
| `POST` | `/api/expenses` | Create. Body: `{ description, amount, categoryId }`. `categoryId` must reference an existing category (**422** `INVALID_CATEGORY` if not). Response **201**. |
| `PATCH` | `/api/expenses/:id` | Partial update; body must include at least one of `description`, `amount`, `categoryId`. |
| `DELETE` | `/api/expenses/:id` | Delete. Response **204** with no body on success. |

**Example create (JSON):**

```json
{
  "description": "Coffee",
  "amount": "4.50",
  "categoryId": 1
}
```

**Success shape:** `{ "success": true, "data": { ... } }`. **Error shape:** `{ "success": false, "error": { "code", "message" } }` (e.g. `VALIDATION_ERROR`, `NOT_FOUND`, `INVALID_CATEGORY`, `DUPLICATE_CATEGORY`).
