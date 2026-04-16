# Summary: tasks — expense-crud-api

## Phase

tasks

## What Was Produced

- Artifact: `.sdd/workspace/expense-crud-api/current/tasks.md`
- **T-001:** **`HttpError`** + **`errorHandler`** + tests.
- **T-002:** **`expenseSchemas`** + **`expenseMapper`** + tests.
- **T-003:** **`expenseRepository`** + mocked pool tests.
- **T-004:** **`routes/expenses`**, **`createApp`**/**`index`** pool wiring.
- **T-005:** Supertest integration tests + **`server/README.md`** API + no-auth warning.

## Key Decisions

1. **Repository** naming: **`server/src/services/expenseRepository.ts`** unless implementation chooses **`repositories/`** — worker must match **`design.md`** dependency direction (no Express in repository).
2. **Integration test file** path: **`server/src/routes/expenses.integration.test.ts`** (adjust if colocation rules differ).

## Risks / Open Issues

- **T-004** touches **`app.ts`** and all **`createApp`** call sites — single PR chunk recommended.

## What the Next Agent Must Know

- **`worker-assignments.json`** assigns **W-1** all tasks **sequentially**. Outputs go under **`implementation/outputs/`** per skill when implementation runs.
