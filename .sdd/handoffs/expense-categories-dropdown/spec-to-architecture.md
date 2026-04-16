# Handoff: spec → design (architecture)

## Feature

`expense-categories-dropdown`

## From / To

Spec → Architecture / Design Agent

## Completed Work (paths)

- `.sdd/workspace/expense-categories-dropdown/current/spec.md`
- `.sdd/summaries/expense-categories-dropdown/spec-summary.md`
- Idea approved and versioned: `.sdd/registry/expense-categories-dropdown/idea/v1.md`

## Key Decisions

- **Option A**: **`POST /api/categories`** for new names; **`POST/PATCH /api/expenses`** use **`categoryId`**.
- Migration: create `categories`, backfill, add FK, drop `expenses.category`.

## Constraints to Preserve

- Zod, asyncHandler, `{ success, data }` / `{ success, error }`, parameterized SQL, rate limit + helmet order unchanged.
- Integration tests pattern: `server/src/routes/expenses.integration.test.ts`.

## Risks

- Breaking change for expense JSON body — version note in README.

## Recommended Next Action

Produce **`design.md`**: exact DDL, API response examples, FK delete behavior, router registration for `/api/categories`, and expense row mapping with JOIN.
