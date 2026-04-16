# Summary: Design — expense-categories-dropdown

## Phase

Design

## What Was Produced

- Artifact: `.sdd/workspace/expense-categories-dropdown/current/design.md`
- Spec versioned: `.sdd/registry/expense-categories-dropdown/spec/v1.md`

## Key Decisions

- **`categories`** table: `id`, unique `name` (128), timestamps; **`expenses.category_id`** FK **`RESTRICT`** / **`CASCADE`** update.
- **API:** `GET/POST /api/categories`; expenses return **`category: { id, name }`** via **JOIN** (no N+1); create/patch use **`categoryId`**.
- **Errors:** **409** `DUPLICATE_CATEGORY`; **422** `INVALID_CATEGORY` for missing category id on expense writes.
- **Migration:** single script order: create table → distinct insert from legacy → backfill → NOT NULL + FK → drop `category` column.
- **Web:** `categoryApi`, updated types/schemas, `<select>` + add flow.

## Risks / Open Issues

- Coordinated **server + web** deploy with migration.

## What the Next Agent (Plan / Work Manager) Must Know

- Touch **`server/src/app.ts`**, expense repository/mapper/schemas, new category route stack, **`web`** API + form + MSW; add **`002_*.sql`**.
