# Plan: React expense UI and totals

## Execution Strategy

- **Approach:** sequential (single worker; hooks depend on API client and money helpers).
- **Estimated workers:** 1
- **Estimated validators:** 1

## Work Phases

### Phase 1: Scaffold and API surface

- **Goal:** Runnable **Next.js** app in **`web/`** with Tailwind, strict TS, env example; typed **`expenseApi`** and shared **`Expense`** types.
- **Tasks:** T-001, T-002
- **Dependencies:** none
- **Validation checkpoint:** yes (`npm run build` in `web/`)

### Phase 2: Money and validation schemas

- **Goal:** **Cents-safe** `money.ts` with unit tests; **zod** schemas for create/patch aligned with API; **logger** no-op in prod.
- **Tasks:** T-003, T-004
- **Dependencies:** Phase 1
- **Validation checkpoint:** yes (unit tests for `money`)

### Phase 3: Hooks

- **Goal:** **`useExpenseList`**, **`useExpenseMutations`**, **`useGrandTotalSum`** with clear loading/error and refetch after mutations.
- **Tasks:** T-005
- **Dependencies:** Phase 2
- **Validation checkpoint:** yes (manual smoke against real API optional; logic testable with MSW in T-006)

### Phase 4: UI composition

- **Goal:** **SummaryBar**, **ExpenseTable**, **ExpenseForm**, **DeleteExpenseDialog**; **`app/page.tsx`** integrates hooks and meets spec a11y baseline.
- **Tasks:** T-006
- **Dependencies:** Phase 3
- **Validation checkpoint:** yes (manual: list, create, edit, delete, totals visible)

### Phase 5: Tests and documentation

- **Goal:** Vitest + RTL + MSW; **`web/README.md`** and root **`README.md`** (dual-server dev, CORS).
- **Tasks:** T-007
- **Dependencies:** Phase 4
- **Validation checkpoint:** yes (`npm test` in `web/`)

## Dependency Map

| Task/Phase | Depends On | Blocking? |
|------------|------------|-----------|
| T-002 | T-001 | yes |
| T-003 | T-002 | yes |
| T-004 | T-003 | yes |
| T-005 | T-004 | yes |
| T-006 | T-005 | yes |
| T-007 | T-006 | yes |

## Integration Approach

- All implementation under **`web/`** plus root **`README.md`** updates.
- **`npm run build`** and **`npm test`** in **`web/`** must pass before marking complete.
- **Express** server unchanged in this feature (CORS doc only).

## Rollout Order

1. Approve **plan** + **tasks**, then implement **T-001** → **T-007** sequentially.
2. Run **`server`** and **`web`** locally; verify CORS.
3. Optional: **`sdd-validate-feature`** after implementation.

## Risks / Coordination Notes

- Next.js and Express **ports** must match **`NEXT_PUBLIC_API_BASE_URL`** in dev.
- Keep files under **250 lines**; split components if needed.

## Human Approval Status

- [x] Plan reviewed by human developer
- [x] Ready to execute **tasks.md** as written
