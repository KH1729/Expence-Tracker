# Plan: Expense categories (dropdown + `categories` table)

## Execution Strategy

- **Approach:** sequential (single worker; migration must run before server code that assumes `category_id`; categories API before expense refactor is easiest to test incrementally).
- **Estimated workers:** 1
- **Estimated validators:** 1

## Work Phases

### Phase 1: Database migration

- **Goal:** Ship **`002_categories_and_expense_fk.sql`** (or final name) implementing `design.md` DDL/backfill/drop; document apply steps in **`server/README.md`**.
- **Tasks:** T-101
- **Dependencies:** none
- **Validation checkpoint:** migration runs clean on dev DB with sample `expenses` rows and on empty `expenses`

### Phase 2: Categories API (server)

- **Goal:** **`GET` / `POST /api/categories`** with zod, repository, mapper, router, **`app.ts`** mount; integration tests for list, create, duplicate **409**.
- **Tasks:** T-102
- **Dependencies:** Phase 1
- **Validation checkpoint:** `npm test` green for new tests; manual GET/POST smoke

### Phase 3: Expenses API refactor (server)

- **Goal:** Replace `category` string with **`categoryId`** on create/patch; **`JOIN`** in list/get; **422** for unknown id; update **`expenseMapper`** for nested **`category`**; repository insert/update use **`category_id`**.
- **Tasks:** T-103
- **Dependencies:** Phase 2 (need categories table + at least one way to create rows for tests)
- **Validation checkpoint:** integration tests updated/added for expenses + invalid **`categoryId`**

### Phase 4: Server tests + API docs

- **Goal:** Full Supertest coverage per **`tasks.md`**; **`server/README.md`** endpoint table + breaking-change note for expense body.
- **Tasks:** T-104
- **Dependencies:** Phase 3
- **Validation checkpoint:** `npm test` in `server/` passes

### Phase 5: Web app

- **Goal:** **`categoryApi`**, updated **`Expense`** types and zod schemas, **`expenseApi`** payloads, **`ExpenseForm`** `<select>` + add-category UX; parent page loads categories and passes props or uses parallel fetch.
- **Tasks:** T-105
- **Dependencies:** Phase 4 (stable API contract)
- **Validation checkpoint:** `npm run build` in `web/`; manual UI smoke

### Phase 6: MSW + web README

- **Goal:** Align **`handlers.ts`** with new shapes; document env + flow in **`web/README.md`**.
- **Tasks:** T-106
- **Dependencies:** Phase 5
- **Validation checkpoint:** web tests (if any) green; MSW does not break dev

## Dependency Map

| Task | Depends On | Blocking? |
|------|------------|-----------|
| T-102 | T-101 | yes |
| T-103 | T-102 | yes |
| T-104 | T-103 | yes |
| T-105 | T-104 | yes |
| T-106 | T-105 | yes |

## Integration Approach

- **Server** and **web** land in one feature branch; deploy migration before or with server binary; web expects new API.
- **`npm run build`** + **`npm test`** in **`server/`** and **`web/`** before marking implementation complete.

## Rollout Order

1. Apply **`002`** migration to target MySQL.
2. Deploy server with new routes.
3. Deploy web.

## Risks / Coordination Notes

- **Fresh installs:** migration must handle **zero** expense rows (only **`categories`** created; first expense requires existing **`categoryId`** from **`POST /api/categories`** — matches Option A).

## Human Approval Status

- [ ] Plan reviewed and approved
- [ ] Ready for implementation per **tasks.md**
