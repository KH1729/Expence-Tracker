# Tasks: Expense categories (dropdown + `categories` table)

## Task List

### T-101: Migration `002` + README note

- **Scope:** Add `server/migrations/002_categories_and_expense_fk.sql` (final filename per repo convention) implementing **`design.md`** steps: `CREATE categories`; seed distinct from legacy **`expenses.category`**; add nullable **`category_id`**; **`UPDATE`** join backfill; **`NOT NULL`** + FK; drop **`category`** + old index. Document how to run migrations in **`server/README.md`** (or link to existing section).
- **Inputs:** `design.md` migration sketch.
- **Dependencies:** none
- **Expected Output:** SQL file + README instructions.
- **Definition of Done:** Script applies cleanly on DB that has **`001`** applied; empty **`expenses`** and populated **`expenses`** both handled.
- **Validation Notes:** No raw user strings in DDL except static SQL; backfill uses **`JOIN`**, not string concat of user input.

### T-102: Categories API module + routes

- **Scope:** Add **`schemas/categorySchemas.ts`**, **`mappers/categoryMapper.ts`**, **`services/categoryRepository.ts`**, **`routes/categories.ts`** (`createCategoriesRouter`), mount **`/api/categories`** in **`app.ts`**. **`GET`** → **`{ items }`** ordered **`name ASC`**. **`POST`** → **201** **`{ category }`**; map **`ER_DUP_ENTRY`** to **409** **`DUPLICATE_CATEGORY`**. Add **`categories.integration.test.ts`** (or extend pattern from expenses): GET **200**, POST **201**, duplicate **409**, validation **400**.
- **Inputs:** `design.md` JSON shapes.
- **Dependencies:** T-101
- **Expected Output:** Working category endpoints + tests.
- **Definition of Done:** **`npm test`** passes; **`asyncHandler`** on all routes; zod on bodies.

### T-103: Expenses repository + schemas + mapper refactor

- **Scope:** **`createBodySchema` / `patchBodySchema`:** **`categoryId`** positive int; remove **`category`** string. **`expenseRepository`:** list/find **`INNER JOIN categories`** (or **`LEFT`** only if justified); insert/update **`category_id`**. Before insert/update, verify category exists or map DB error to **422** **`INVALID_CATEGORY`**. **`expenseMapper`:** nested **`category`**. **`server/src/types/expense.ts`** if present — align API **`Expense`**.
- **Inputs:** `design.md`, existing `expenseRepository.ts` / mapper.
- **Dependencies:** T-102
- **Expected Output:** Expense CRUD uses FK; responses include nested category.
- **Definition of Done:** No **`category`** column reads in SELECT list; placeholders only.

### T-104: Expenses integration tests + server README API table

- **Scope:** Update **`expenses.integration.test.ts`** for **`categoryId`** bodies and nested **`category`** in responses; add cases: **422** bad **`categoryId`** on POST/PATCH. Expand **`server/README.md`**: **`/api/categories`**, breaking change for **`POST/PATCH /api/expenses`**, error codes **409/422** where relevant.
- **Inputs:** T-103 outputs.
- **Dependencies:** T-103
- **Expected Output:** Green integration suite; README current.
- **Definition of Done:** Arrange / Act / Assert; mock pool patterns preserved.

### T-105: Web — API clients, types, ExpenseForm

- **Scope:** **`web/src/types/expense.ts`**: nested **`category`**. **`schemas/expense.ts`**: **`categoryId`** for create/patch. **`services/categoryApi.ts`**: **`listCategories`**, **`createCategory`**. **`services/expenseApi.ts`**: send **`categoryId`**; parse nested category. Update **`ExpenseForm`**: `<select>` for category; inline or collapsible “Add category” (name → **`createCategory`** → append option → set **`categoryId`**). Update parent **`page.tsx`** (or hooks) to **`listCategories`** on load and pass into form. Fix any list/table components that displayed **`expense.category`** string.
- **Inputs:** `design.md`.
- **Dependencies:** T-104
- **Expected Output:** Web builds; form works against real API in dev.
- **Definition of Done:** No `any`; loading/error states acceptable minimum (match existing patterns).

### T-106: MSW + web README

- **Scope:** **`web/src/mocks/handlers.ts`**: categories endpoints; expenses payloads/responses with nested **`category`**. **`web/README.md`**: breaking API note, flow “create category then expense”. Run **`web`** test script if present.
- **Inputs:** T-105 outputs.
- **Dependencies:** T-105
- **Expected Output:** Local dev with MSW matches server contract.
- **Definition of Done:** No stale **`category`** string mocks.

## Human Approval Status

- [ ] Task list reviewed and approved with plan
- [ ] Ready for worker execution **T-101** → **T-106**
