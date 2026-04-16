# Design: Expense categories (dropdown + `categories` table)

## Design Summary

Add a **`categories`** table and **`expenses.category_id`** FK (**`ON DELETE RESTRICT`**, **`ON UPDATE CASCADE`**). New Express router **`/api/categories`** (**`GET`** list, **`POST`** create). Refactor **`/api/expenses`** to accept **`categoryId`** on create/patch and return each expense with a nested **`category: { id, name }`** from a **single SQL `LEFT JOIN`** (or **`INNER JOIN`** once `category_id` is NOT NULL) per list/get — **no N+1**. One migration script **`002_categories_and_expense_fk.sql`** creates the table, seeds distinct names from legacy **`expenses.category`**, backfills **`category_id`**, drops **`category`**, adds FK + index. **Duplicate** category **`POST`** maps MySQL **`ER_DUP_ENTRY`** to **409** **`DUPLICATE_CATEGORY`**. Unknown **`categoryId`** on expense write returns **422** **`INVALID_CATEGORY`** (semantic validation; keeps **404** for missing **expense** id only). Web: **`categoryApi.ts`**, extend **`Expense`** type, **`ExpenseForm`** uses **`<select>`** plus small “add category” control that **`POST`s** then updates local options and selection.

## Architecture Impact

- **Impact level:** high (DB migration, breaking API contract for expenses, new router, repository + mapper changes, MSW + tests).
- **New:** `routes/categories.ts`, `services/categoryRepository.ts`, `schemas/categorySchemas.ts`, `mappers/categoryMapper.ts`, migration **`002_*.sql`**.
- **Modified:** `expenseSchemas.ts`, `expenseRepository.ts` (JOIN + inserts), `expenseMapper.ts` / types, `app.ts` (mount **`/api/categories`**), `web` API client, form, mocks, READMEs.

## Data model

### `categories`

| Column | Type | Notes |
|--------|------|--------|
| `id` | `BIGINT UNSIGNED` | PK, auto-increment |
| `name` | `VARCHAR(128)` | `NOT NULL`, **`UNIQUE`** (trim enforced in app before insert) |
| `created_at` | `DATETIME(3)` | default `CURRENT_TIMESTAMP(3)` |
| `updated_at` | `DATETIME(3)` | on update, match `expenses` |

Index: unique on **`name`**.

### `expenses` (delta)

| Change | Notes |
|--------|--------|
| `category_id` | `BIGINT UNSIGNED NOT NULL` after backfill |
| FK | `FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE` |
| Drop | `category` VARCHAR after backfill |

### Migration script sketch (order)

1. `CREATE TABLE IF NOT EXISTS categories (...)`.
2. `INSERT INTO categories (name, created_at, updated_at)` — `SELECT DISTINCT TRIM(category), … FROM expenses WHERE TRIM(category) <> ''` (handle empty DB: zero rows inserted).
3. `ALTER TABLE expenses ADD COLUMN category_id BIGINT UNSIGNED NULL` (temporary nullable for backfill).
4. `UPDATE expenses e INNER JOIN categories c ON TRIM(e.category) = c.name SET e.category_id = c.id`.
5. Fail migration if any `expenses.category_id IS NULL` while `description` is set (data integrity) — or delete orphan test rows in dev only; production expects all rows matched.
6. `ALTER TABLE expenses MODIFY category_id BIGINT UNSIGNED NOT NULL`, add FK, index on `category_id` if not covered by FK.
7. `ALTER TABLE expenses DROP COLUMN category`, `DROP INDEX idx_expenses_category` if it existed on `category`.

## JSON shapes

### `Category` (API)

```json
{
  "id": 1,
  "name": "Food",
  "createdAt": "2026-04-16T12:00:00.000Z",
  "updatedAt": "2026-04-16T12:00:00.000Z"
}
```

### `GET /api/categories` — 200

```json
{
  "success": true,
  "data": {
    "items": [/* Category[] */]
  }
}
```

**Order:** `name ASC`, `id ASC` tie-break.

### `POST /api/categories` — 201

```json
{
  "success": true,
  "data": {
    "category": { /* Category */ }
  }
}
```

**409:** `{ "success": false, "error": { "code": "DUPLICATE_CATEGORY", "message": "…" } }`

### `Expense` (updated)

Replace flat **`category: string`** with:

```json
{
  "id": 1,
  "description": "Coffee",
  "amount": "4.50",
  "category": { "id": 3, "name": "Food" },
  "createdAt": "…",
  "updatedAt": "…"
}
```

List and single expense use the same **`Expense`** shape.

### `POST /api/expenses` body

```json
{
  "description": "Coffee",
  "amount": "4.50",
  "categoryId": 3
}
```

### `PATCH /api/expenses/:id` body

At least one of: `description`, `amount`, `categoryId` (same validation rules as today for description/amount).

### Error codes (new)

| HTTP | `error.code` | When |
|------|----------------|------|
| 409 | `DUPLICATE_CATEGORY` | Unique name violation on POST category |
| 422 | `INVALID_CATEGORY` | `categoryId` not found for expense create/patch |

## Server modules

| Module | Responsibility |
|--------|----------------|
| `schemas/categorySchemas.ts` | Zod: `createCategoryBody` `{ name }`, trim, 1–128 chars |
| `services/categoryRepository.ts` | `listCategories`, `insertCategory` (catch duplicate → throw `HttpError` 409) |
| `routes/categories.ts` | `createCategoriesRouter({ pool, logger })` — GET `/`, POST `/` |
| `services/expenseRepository.ts` | SELECT with `JOIN categories`; INSERT/UPDATE `category_id` |
| `mappers/expenseMapper.ts` | Map joined row → `Expense` with nested `category` |

**Mount:** `app.use('/api/categories', createCategoriesRouter({ pool, logger }))` next to expenses.

## Web

- **`types/expense.ts`:** `category: { id: number; name: string }`.
- **`schemas/expense.ts`:** `categoryId: z.coerce.number().int().positive()` for create; patch optional.
- **`services/categoryApi.ts`:** `listCategories()`, `createCategory(name)` — mirror `expenseApi` error handling.
- **`ExpenseForm`:** Load categories (props or hook); `<select value={categoryId}>`; “Add category” → modal or inline second row: name input → POST → push to list → `setValue('categoryId', newId)`.
- **MSW `handlers.ts`:** Update mock expenses to nested category; add category handlers.

## Testing

- Integration: GET/POST categories; POST expense with bad `categoryId` → 422; duplicate category → 409; happy paths.
- Mapper unit: joined row → JSON.
- Web: smoke test form renders select when categories provided (optional).

## Rollout

- Run **`002`** migration before deploying new server build.
- **Breaking:** clients using string **`category`** must upgrade with web deploy in same release.

## Risks

| Risk | Mitigation |
|------|------------|
| Migration mismatch on legacy strings | Distinct + trim join; manual fix script documented if needed |
| Breaking mobile/other clients | README + changelog |

## Human Approval Status

- [x] Design reviewed by human developer
- [x] Ready to proceed to Plan / Tasks phase
