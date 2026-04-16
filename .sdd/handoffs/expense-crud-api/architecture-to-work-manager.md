# Handoff: Architecture Agent → Work Manager Agent

## Feature

expense-crud-api

## From

Architecture Agent (Design)

## To

Work Manager Agent (Plan + Tasks)

## Completed Work

- Artifact: `.sdd/workspace/expense-crud-api/current/design.md`
- Summary: `.sdd/summaries/expense-crud-api/design-summary.md`

## Key Decisions

1. Introduce **`HttpError`** and extend **`createErrorHandler`** for **400/404/503** with project JSON shape.
2. New files: **`errors/httpError.ts`**, **`schemas`** (expense zod), **`services/expenseRepository.ts`**, **`mappers/expenseMapper.ts`**, **`routes/expenses.ts`**; wire **pool** through **`createApp`** / **`index.ts`**.
3. **HTTP 400** for all validation failures (**`VALIDATION_ERROR`**).

## Constraints to Preserve

- Middleware order unchanged; expenses router **before** **notFound**.
- Parameterized SQL only; **pino** logging; no secrets in logs or responses.
- **DELETE** success → **204** empty body.

## Risks / Open Issues

- Pool injection changes **`CreateAppOptions`** — all callers (tests) must pass **pool** or a test double.

## Recommended Next Action

- Break work into tasks: **(1)** HttpError + errorHandler + tests, **(2)** repository + mapper + unit tests, **(3)** router + app wiring, **(4)** integration tests + README. Initialize **`implementation/task-board.json`** and **`worker-assignments.json`**.
