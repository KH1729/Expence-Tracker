# Summary: Spec — expense-categories-dropdown

## Phase

Spec

## What Was Produced

- Artifact: `.sdd/workspace/expense-categories-dropdown/current/spec.md`
- **Option A** locked: **`POST /api/categories`** then expense create/patch with **`categoryId`** (no server-side auto-create category on expense POST).

## Key Decisions

- New **`categories`** table; **`expenses`** reference via **`category_id`** FK; migration backfills from legacy **`category`** VARCHAR then drops it.
- New endpoints: **`GET /api/categories`**, **`POST /api/categories`** (201, 409 on duplicate).
- Expense create/patch: **`categoryId`** only; validate FK exists; return category display data on GET expenses.
- Web: dropdown + add-category flow calling POST categories before POST expense.

## Risks / Open Issues

- **Breaking API change** for clients sending **`category`** string — documented in README.
- **ON DELETE** policy for categories with expenses — Design must specify (default suggestion: RESTRICT).

## What the Next Agent (Design) Must Know

- Read **`spec.md`**; implement DDL, route mounting in **`app.ts`**, repository joins, and TypeScript types aligned with existing Express/mysql2 patterns.
