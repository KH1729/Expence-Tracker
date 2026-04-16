# Handoff: architecture → work manager

## Feature

`expense-categories-dropdown`

## From / To

Design → Work Manager (Plan + Tasks)

## Completed Work (paths)

- `.sdd/workspace/expense-categories-dropdown/current/design.md`
- `.sdd/summaries/expense-categories-dropdown/design-summary.md`
- Registry: `.sdd/registry/expense-categories-dropdown/spec/v1.md`, idea `v1.md`

## Key Decisions

- Nested **`category`** on **`Expense`** API; **`categoryId`** on write bodies.
- **422** / **409** codes as in design; **JOIN** for list/get expenses.
- Migration **`002`** with backfill and column drop.

## Constraints to Preserve

- Middleware order; **`asyncHandler`**; zod; parameterized SQL; Vitest + Supertest patterns.

## Recommended Next Action

Author **`plan.md`** and **`tasks.md`**, **`task-board.json`**, **`worker-assignments.json`** under `.sdd/workspace/expense-categories-dropdown/implementation/`.
