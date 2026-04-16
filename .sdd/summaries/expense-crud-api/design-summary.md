# Summary: design — expense-crud-api

## Phase

design

## What Was Produced

- Artifact: `.sdd/workspace/expense-crud-api/current/design.md`
- **Router** `/api/expenses` mounted in **`app.ts`** after health; **repository** + **zod** + **mapper**; **`HttpError`** + **errorHandler** branch for **400/404/503** JSON.
- **Validation:** **400** + **`VALIDATION_ERROR`** only (no **422** in this feature).
- **No DDL** in this feature; optional **`created_at`** index noted as future perf only.
- **Tests:** Vitest + Supertest; mocked pool for integration-style tests.

## Key Decisions

1. **`HttpError`** operational errors instead of ad-hoc `res.status` in every handler (keeps routes thin and consistent).
2. **`expenseRepository`** owns all SQL; routes only validate and map.
3. **README** must warn: **no auth** on expense API in MVP.

## Risks / Open Issues

- **`Number`** for **`id`** in JSON is acceptable for MVP volumes; revisit if ids approach **2^53**.

## What the Next Agent Must Know

- **Work Manager** should produce **plan.md** + **tasks.md**, **`task-board.json`**, **`worker-assignments.json`**, and handoff **`manager-to-workers.md`**. Implementation must update **`createApp`** signature to receive **pool**, adjust **errorHandler**, and add **README** API section.
