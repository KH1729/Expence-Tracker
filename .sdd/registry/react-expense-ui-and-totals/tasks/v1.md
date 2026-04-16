# Tasks: React expense UI and totals

## Task List

### T-001: Scaffold Next.js app in `web/`

- **Scope:** Create **`web/`** with **Next.js App Router**, **TypeScript** (`strict`), **Tailwind CSS**, **ESLint**. Add **`app/layout.tsx`** (metadata, fonts optional), placeholder **`app/page.tsx`** (can be replaced in T-006). Add **`next.config.ts`**, **`tsconfig.json`**, **`.env.local.example`** with **`NEXT_PUBLIC_API_BASE_URL=`**. Verify **`npm run dev`** and **`npm run build`** succeed.
- **Inputs:** `design.md` (paths, env var name).
- **Dependencies:** none
- **Expected Output:** Runnable **`web/`** package; no business logic yet.
- **Definition of Done:** `cd web && npm run build` exits 0.
- **Validation Notes:** No `any`; `"use client"` not required on scaffold shell until T-006.

### T-002: Types and `expenseApi` service

- **Scope:** Add **`web/src/types/expense.ts`** (**`Expense`** aligned with API). Add **`web/src/services/expenseApi.ts`** implementing **`list`**, **`getById`**, **`create`**, **`patch`**, **`remove`** using **`fetch`** + `new URL('/api/expenses', base)` / id paths. Parse **`{ success, data }`** / **`{ success, false, error }`**; **`204`** delete with **no JSON body**. Map failures to a small **`ApiError`** or typed result—**no `any`**.
- **Inputs:** `spec.md` FR, `design.md`, expense-crud API shapes.
- **Dependencies:** T-001
- **Expected Output:** Service module + types; unit tests optional here (MSW in T-007) or minimal pure parse tests.
- **Definition of Done:** Typecheck passes; service methods match HTTP contract.
- **Validation Notes:** `amount` remains **string** in **`Expense`**.

### T-003: `money.ts`, `logger.ts`, and money unit tests

- **Scope:** **`web/src/lib/money.ts`**: `parseAmountToCents`, `sumCents`, `formatCents` (or equivalent names)—all **integer cents** internally. **`web/src/lib/logger.ts`**: dev-only or no-op in production—**no `console.log`** in prod bundle paths. **`web/src/lib/money.test.ts`** (Vitest): edge cases—two decimals, invalid input rejection, sum of multiple strings.
- **Inputs:** `design.md`, `spec.md` FR-7/FR-10.
- **Dependencies:** T-002
- **Expected Output:** Lib modules + passing unit tests.
- **Definition of Done:** `npm test` covers money helpers.
- **Validation Notes:** No floating-point accumulation for money sums.

### T-004: Zod schemas for expense forms

- **Scope:** **`web/src/schemas/expense.ts`**: create and patch schemas (trim, lengths, positive amount, max 2 decimal places)—mirror API validation intent. Export types via **`z.infer`**. Prepare for **`@hookform/resolvers/zod`** in T-006.
- **Inputs:** `spec.md` FR-3–FR-6, API spec.
- **Dependencies:** T-003
- **Expected Output:** Schemas + exports; optional tiny unit test for invalid cases.
- **Definition of Done:** Empty patch concept prevented at schema level where applicable.
- **Validation Notes:** Align error messages with UX in T-006.

### T-005: Data hooks

- **Scope:** Implement **`useExpenseList`** (limit default 20, offset, total from API, loading/error/retry), **`useExpenseMutations`** (create/patch/delete, invalidate or refetch list, handle **204**), **`useGrandTotalSum`** (after first list success: paginate **`limit=100`**, accumulate until full **`total`**, sum via **`money`**, loading/error/retry). Keep hooks free of JSX.
- **Inputs:** `design.md` data flow, T-002–T-004 outputs.
- **Dependencies:** T-004
- **Expected Output:** Three hook modules under **`web/src/hooks/`**.
- **Definition of Done:** Hooks compile; grand total matches spec algorithm (manual or unit test with mocked `expenseApi`).
- **Validation Notes:** Hooks do not import from **`components/`**.

### T-006: Components and dashboard page

- **Scope:** **`SummaryBar`** (row count, page subtotal, grand total states). **`ExpenseTable`** with edit/delete actions. **`ExpenseForm`** (create + edit modes, **react-hook-form** + zod). **`DeleteExpenseDialog`**. **`app/page.tsx`**: **`"use client"`** + one-line justification comment; compose hooks + components; pagination controls; empty state; accessible labels.
- **Inputs:** `spec.md` FR-2–FR-5, `design.md`.
- **Dependencies:** T-005
- **Expected Output:** Feature-complete UI per spec MVP.
- **Definition of Done:** Manual smoke: CRUD + totals visible; keyboard-friendly primary paths.
- **Validation Notes:** No business logic in components beyond wiring—logic stays in hooks/lib.

### T-007: MSW, RTL tests, and READMEs

- **Scope:** Vitest + RTL + MSW setup in **`web/`**. Handlers for expenses API. Tests: empty list, validation error on submit, delete flow (behavior-focused). Update **`web/README.md`** (scripts, env, CORS). Update **root `README.md`** to document running **`server`** + **`web`** and CORS expectation.
- **Inputs:** `spec.md` NFR-4, acceptance criteria.
- **Dependencies:** T-006
- **Expected Output:** Tests green; documentation complete.
- **Definition of Done:** `npm test` passes; README sufficient for a new developer.
- **Validation Notes:** No real network in unit tests; Arrange/Act/Assert.

## Human Approval Status

- [x] Task list reviewed by human developer
- [x] Ready for worker execution **T-001** → **T-007**
