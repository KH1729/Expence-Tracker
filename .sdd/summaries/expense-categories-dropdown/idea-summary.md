# Summary: Idea — expense-categories-dropdown

## Phase

Idea

## What Was Produced

- Artifact: `.sdd/workspace/expense-categories-dropdown/current/idea.md`
- Feature captures: dropdown UI instead of free text; new `categories` table; ability to add categories; wiring so new expenses persist categories in the new table (user mentioned PUT—clarify in Spec).

## Key Decisions

- Treat this as a **managed category list** with DB backing, not a client-only enum.
- Defer exact REST semantics (**POST vs PUT**, upsert vs separate create-then-expense) to **Spec** to match project conventions and the user’s intent.

## Risks / Open Issues

- **Migration** from current `expenses.category` VARCHAR to FK (or parallel fields) must be explicit to avoid data loss.
- **Duplicate category names**: unique constraint and error handling—decide in Spec.

## What the Next Agent (Spec) Must Know

- Today: `ExpenseForm` uses a text input; `expenses.category` is VARCHAR; CRUD APIs validate category as string—see `server/src/schemas/expenseSchemas.ts`, `web/src/schemas/expense.ts`, `server/migrations/001_create_expenses.sql`.
- User wants dropdown + new table + ability to add categories when creating expenses.
