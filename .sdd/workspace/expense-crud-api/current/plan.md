# Plan: Expense CRUD API

## Execution Strategy

- **Approach:** sequential (single worker; shared `server/` files and ordering constraints).
- **Estimated workers:** 1
- **Estimated validators:** 1

## Work Phases

### Phase 1: Operational errors and global error handler

- **Goal:** **`HttpError`** type and **`createErrorHandler`** branch so **400/404/503** return JSON without **500**; unit tests for the branch.
- **Tasks:** T-001
- **Dependencies:** none (builds on existing `server/`)
- **Validation checkpoint:** yes (tests prove **HttpError** response shape)

### Phase 2: Validation schemas and row mapping

- **Goal:** Zod schemas for list query, id param, create body, patch body; **Expense** mapper from DB row to API JSON (**amount** string, ISO dates).
- **Tasks:** T-002
- **Dependencies:** Phase 1 (optional for pure unit tests, but **T-003** needs types — run after **T-001** to avoid merge churn)
- **Validation checkpoint:** yes (schema + mapper unit tests)

### Phase 3: Repository layer

- **Goal:** Parameterized SQL for **count**, **list**, **findById**, **insert**, **updatePartial**, **deleteById**; map DB failures to **503** where appropriate inside route or repository contract.
- **Tasks:** T-003
- **Dependencies:** Phase 2 (mapper + types)
- **Validation checkpoint:** yes (repository tests with **mocked** `pool.query`)

### Phase 4: HTTP routes and app wiring

- **Goal:** **`createExpensesRouter`**, mount **`/api/expenses`**; extend **`CreateAppOptions`** with **pool**; **`index.ts`** passes pool into **`createApp`**.
- **Tasks:** T-004
- **Dependencies:** Phase 3
- **Validation checkpoint:** yes (manual smoke or quick supertest sanity)

### Phase 5: Integration tests and API documentation

- **Goal:** Supertest suite against **`createApp`** with mocked pool; **README** endpoint table + **no-auth** warning per design.
- **Tasks:** T-005
- **Dependencies:** Phase 4
- **Validation checkpoint:** yes (`npm test` green)

## Dependency Map

| Task/Phase | Depends On | Blocking? |
|------------|------------|-----------|
| T-002 | T-001 | soft (sequential recommended) |
| T-003 | T-002 | yes |
| T-004 | T-003 | yes |
| T-005 | T-004 | yes |

## Integration Approach

- All changes under **`server/src/`** plus **`server/README.md`**; no new migrations.
- **`npm run build`** and **`npm test`** must pass before marking implementation complete.

## Rollout Order

1. Merge implementation after tasks approved.
2. Ensure MySQL has **`expenses`** table (foundation migration already applied).
3. Run **`npm run dev`**, exercise **`/api/expenses`** with curl or HTTP client.

## Risks / Coordination Notes

- **`createApp`** signature change requires updating any test that constructs the app (health tests) to pass **pool**.

## Human Approval Status

- [x] Plan reviewed and approved (2026-04-16)
- [x] Ready for implementation per **tasks.md**
