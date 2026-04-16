# Design: Expense CRUD API

## Design Summary

Implement **`/api/expenses`** as a dedicated Express **router** mounted from **`createApp`** after **`/health`**, before **`notFoundHandler`**. A thin **route** layer validates **query**, **params**, and **body** with **zod**, then calls a **repository** module that runs **parameterized** `mysql2` pool queries. Rows are mapped to the **Expense** API shape (camelCase, **`amount`** as a two-decimal **string**, ISO timestamps). Operational failures (**validation**, **not found**) use a small **`HttpError`** type with **`statusCode`** and **`error.code`** so **`createErrorHandler`** returns **400** / **404** / **503** JSON without treating them as **500**. **Validation** failures use **HTTP 400** and **`VALIDATION_ERROR`** project-wide. Integration tests use **Vitest** + **Supertest** against **`createApp`** with a **mocked pool** (or test double) to avoid a real MySQL for most cases; optional **live DB** test is out of scope unless the task plan adds it.

## Architecture Impact

- **Impact level:** medium (new modules, **error handler** behavior change, **`app.ts`** wiring).
- **New components:** HTTP error type, zod schemas, expense repository, expenses router, row→JSON mapper, tests.
- **Modified components:** **`server/src/middleware/errorHandler.ts`** (handle **`HttpError`**), **`server/src/app.ts`** (mount router + inject **pool**).

## Components / Modules Affected

| Component | Change Type | Description |
|-----------|-------------|-------------|
| `server/src/errors/httpError.ts` | new | **`HttpError`** with **`statusCode`**, **`code`**, **`message`**; thrown for 400/404/503 operational cases. |
| `server/src/middleware/errorHandler.ts` | modified | If `err instanceof HttpError`, send **`statusCode`** and **`{ success: false, error: { code, message } }`**; else existing **500** behavior. |
| `server/src/schemas/expenseQuery.ts` (or `expenseSchemas.ts`) | new | Zod: **list query** (`limit`, `offset`), **id param** (positive integer string / bigint-safe), **create body**, **patch body** (at least one field). |
| `server/src/services/expenseRepository.ts` | new | `list`, `count`, `findById`, `insert`, `updatePartial`, `deleteById` using **placeholders** only. |
| `server/src/mappers/expenseMapper.ts` | new | DB row → **`Expense`**; format **`amount`** with two decimals (e.g. `Decimal`/`toFixed`). |
| `server/src/routes/expenses.ts` | new | **`createExpensesRouter({ pool, logger })`** — all CRUD + **asyncHandler**. |
| `server/src/app.ts` | modified | Accept **`Pool`** (or factory); **`app.use('/api/expenses', expensesRouter)`**. |
| `server/src/index.ts` | modified | Pass **pool** into **`createApp`** (in addition to existing deps). |
| `server/src/routes/expenses.integration.test.ts` (path per task board) | new | Supertest: happy paths + validation + not-found samples. |
| `server/README.md` | modified | Document **expense endpoints**, **MVP no-auth** warning, example payloads. |

**Dependency direction:** `routes` → `schemas` + `repository` + `mappers` + `errors`; **`repository`** must not import Express.

## Interfaces / APIs

### GET /api/expenses

- **Query:** `limit` (1–100, default 20), `offset` (≥0, default 0).
- **200:** `{ "success": true, "data": { "items": Expense[], "total": number } }`.
- **SQL sketch:** `SELECT COUNT(*) AS total FROM expenses`; `SELECT … ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`.

### GET /api/expenses/:id

- **200:** `{ "success": true, "data": { "expense": Expense } }`.
- **404:** `NOT_FOUND` if no row.

### POST /api/expenses

- **Body:** `description`, `amount` (coerced from number/string), `category`.
- **201:** `{ "success": true, "data": { "expense": Expense } }`.
- **SQL:** `INSERT INTO expenses (description, amount, category) VALUES (?, ?, ?)` → `insertId` or follow-up select.

### PATCH /api/expenses/:id

- **Body:** at least one of `description`, `amount`, `category`; empty object **400**.
- **200:** full **`Expense`** after update (prefer single **`UPDATE …`** + **`SELECT`** by id, or **`UPDATE`** with `ROW_COUNT()` and fetch).

### DELETE /api/expenses/:id

- **204:** no body when `affectedRows === 1`.
- **404:** when no row matched.

### HttpError handling

- **`errorHandler`:** `if (err instanceof HttpError) { res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } }); return; }`

## Data Flow

1. Request hits **`/api/expenses`** → route parses with zod → repository → mapper → JSON.
2. Repository errors: map **MySQL** connection errors to **503** **`SERVICE_UNAVAILABLE`** (or **`DATABASE_UNAVAILABLE`**) with generic message; **no** errno in client body.
3. **Not found:** repository returns **`null`** or throws **`HttpError`** **404** **`NOT_FOUND`**.

## Data Model / Schema Changes

| Entity | Change | Notes |
|--------|--------|--------|
| `expenses` | none | No new migration in this feature. **Optional later:** secondary index on **`created_at`** if `ORDER BY` becomes hot — not required for MVP. |

## Security Considerations

- **No authentication** in this release; **README** must state that **public exposure** requires **future auth** or **private network**.
- **SQL injection:** prevented by **placeholders** only.
- **Rate limiting** already global; no per-user limits.

## Observability Considerations

- **pino:** log route + **expense id** (when present) at **info** for mutations; **warn**/**error** for DB failures without SQL text containing literals.

## Testing Strategy

- **Unit tests:** zod schemas (edge cases), **mapper** (decimal formatting, dates).
- **Integration tests (Supertest):** mock **`pool.query`** / **`execute`** to return controlled **ResultSetHeader** and rows; assert status codes and JSON shapes.
- **Minimum per spec:** happy path per method group + one **validation** + one **not-found** case (can be consolidated in fewer files if colocated).

## Rollout / Migration Notes

- Deploy **after** foundation migration **`001_create_expenses.sql`** is applied.
- No data migration.

## Risks / Tradeoffs

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **errorHandler** only knew **500** | — | high | **HttpError** branch before generic **500**. |
| **Number** precision for **id** in JSON | low | medium | Keep ids **&lt;** `Number.MAX_SAFE_INTEGER` or document; for MVP **BIGINT** rows stay in safe range. |
| **COUNT(*)** on every list | — | medium at scale | Documented in spec; add caching or approximate later. |

## HTTP status decision

- **400** for all **zod** and business validation (**VALIDATION_ERROR**). **422** not used in this feature to keep one convention.

## Example payloads

**POST /api/expenses**

```json
{
  "description": "Coffee",
  "amount": "4.50",
  "category": "Food"
}
```

**200 list**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "description": "Coffee",
        "amount": "4.50",
        "category": "Food",
        "createdAt": "2026-04-16T12:00:00.000Z",
        "updatedAt": "2026-04-16T12:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```
