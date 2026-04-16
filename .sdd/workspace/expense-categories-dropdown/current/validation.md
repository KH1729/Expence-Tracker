# Validation Report: expense-categories-dropdown

## Metadata

| Field | Value |
|--------|--------|
| Feature | `expense-categories-dropdown` |
| Scope | `implementation` (code + tests vs approved **spec**, **design**, **tasks** registry v1) |
| Validated | 2026-04-16 |
| Role | Validation Agent (review only; no code changes) |

## Executive summary

**Overall outcome: PASS**

Implementation matches the approved **Option A** flow (`POST /api/categories` then expenses with `categoryId`), database design ( **`categories`** + **`expenses.category_id`**, **`ON DELETE RESTRICT`**, **`ON UPDATE CASCADE`** ), API error codes (**409** / **422**), and task deliverables (migration **002**, categories + expenses routes, web UI, MSW, README updates). Automated tests pass for **server** (38) and **web** (9).

No **critical** or **error**-severity findings. Minor **info** items are documentation polish and optional alignment with project JSDoc conventions.

---

## Check matrix

| ID | Requirement (source) | Result | Evidence |
|----|------------------------|--------|----------|
| V-01 | New **`categories`** table; FK from **`expenses`**; backfill then drop legacy **`category`** column (**spec** / **design**) | **PASS** | `server/migrations/002_categories_and_expense_fk.sql`: `CREATE categories`, `DISTINCT` seed, `UPDATE` join backfill, `NOT NULL`, `fk_expenses_category` with **`ON DELETE RESTRICT`**, **`ON UPDATE CASCADE`**, **`DROP COLUMN category`** |
| V-02 | **`GET` / **`POST /api/categories`**; list ordered by name; **201** on create (**design**) | **PASS** | `server/src/routes/categories.ts`: `GET /` → `{ data: { items } }`; `POST /` → **201** `{ category }`; `listCategories` + zod body |
| V-03 | **409** `DUPLICATE_CATEGORY` on duplicate name (**design**) | **PASS** | `categoryRepository.ts` maps **`ER_DUP_ENTRY`** → **409**; `categories.integration.test.ts` asserts code |
| V-04 | Expenses use **`categoryId`** on create/patch; **no** auto-create category on expense POST (**spec** Option A) | **PASS** | `expenses.ts`: **`findCategoryById`** before insert/patch **`categoryId`**; **422** if missing (**lines 83–89, 119–127**) |
| V-05 | **422** `INVALID_CATEGORY` for unknown id (**design**) | **PASS** | `HttpError` **422** + code **`INVALID_CATEGORY`**; `expenses.integration.test.ts` |
| V-06 | Responses include **`category: { id, name }`** via **JOIN**, not N+1 list (**design**) | **PASS** | `expenseRepository.ts`: **`INNER JOIN categories`** in list/find queries; mapper produces nested shape |
| V-07 | Zod on bodies; **`asyncHandler`** on routes (**tasks** / stack rules) | **PASS** | `createCategoryBodySchema`, `createBodySchema` / `patchBodySchema`; routers use **`asyncHandler`** |
| V-08 | Web: types, **`categoryId`** in forms/API, dropdown + add-category flow (**tasks** T-105) | **PASS** | `web/src/types/expense.ts`, `schemas/expense.ts`, `ExpenseForm.tsx` (select + add flow), `categoryApi.ts`, `ExpenseDashboard.tsx` |
| V-09 | MSW aligned with server contract (**tasks** T-106) | **PASS** | `web/src/mocks/handlers.ts`: **`/api/categories`**, expenses with **`categoryId`** + nested **`category`** |
| V-10 | Server + web README document API / migration / breaking shape (**tasks**) | **PASS** | `server/README.md`: **002**, categories section, **`categoryId`** table; `web/README.md`: categories + **`categoryId`** note |
| V-11 | Integration tests for categories + updated expenses (**tasks**) | **PASS** | `categories.integration.test.ts`, `expenses.integration.test.ts` |
| V-12 | **`npm test`** green server + web (**tasks**) | **PASS** | 2026-04-16: server **38/38**, web **9/9** |

---

## Findings

| Severity | ID | Summary | Evidence |
|----------|-----|---------|----------|
| Info | F-01 | Root **`README.md`** quick start still says “Run **the** migration” (singular) and does not mention **`002`** or the **`category` → `categoryId`** breaking change. | `README.md` lines 12–13 vs `server/README.md` (full detail). Low risk while server README is canonical. |
| Info | F-02 | Project rules ask for JSDoc on every exported component/hook with **`@param`** / **`@returns`**. Some web components (e.g. **`ExpenseForm`**) use typed props but no full JSDoc block on the export. | `web/src/components/ExpenseForm.tsx` — documentation debt only; does not block functional validation. |

---

## Escalation

No **critical** findings — escalation **not** required.

---

## Recommendation

- **Human decision:** Approve **validation** phase to mark the feature **DONE** in SDD, or request rework only if you want root README clarification or JSDoc sweep (optional).
- **Optional follow-ups (non-blocking):** One-line root README pointer to **`001` + `002`** and “expenses use **`categoryId`**”; add JSDoc to **`ExpenseForm`** if enforcing repo documentation rules strictly.

---

## Validator rules observed

- Compared outputs to **registry v1** artifacts and workspace **tasks.md** definitions.
- Did **not** modify application code or SDD artifacts other than this report and the summary/state updates required by the validate-feature workflow.
