# Handoff: idea → spec

## Feature

`expense-categories-dropdown`

## From / To

Idea → Spec Agent

## Completed Work (paths)

- `.sdd/workspace/expense-categories-dropdown/current/idea.md`
- `.sdd/summaries/expense-categories-dropdown/idea-summary.md`

## Key Decisions

- Introduce a **`categories`** table and move UI from free-text to **dropdown** with **add-new** capability.
- Expense rows must **reference** managed categories (FK or equivalent); avoid two sources of truth.

## Constraints to Preserve

- Zod validation; asyncHandler; `{ success, data }` / `{ success, error }` responses; parameterized queries.
- No auth/tenancy expansion unless explicitly added in Spec.

## Risks

- Data migration from existing `category` strings.
- Clarify user’s **PUT** mention vs standard **POST** for category creation.

## Recommended Next Action

Draft **`spec.md`**: functional requirements (list/create categories, create/update expense with category), API routes and methods, acceptance criteria, and explicit migration/backfill rules for existing data.
