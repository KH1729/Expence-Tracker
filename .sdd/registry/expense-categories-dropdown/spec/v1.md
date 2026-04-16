# Spec: Expense categories (dropdown + `categories` table)

## Background / Context

The **expense-crud-api** feature stores `category` as a **VARCHAR** on `expenses` and accepts any non-empty string from clients. The UI uses a **text input**. The product now requires **managed categories** in a dedicated **`categories`** table, a **dropdown** in the expense form, and an explicit **create-category-then-create-expense** client flow (**Option A**, human-approved with the Idea).

## Problem Statement

Free-text categories are inconsistent (typos, duplicates) and cannot be listed or reused reliably. The system needs a **normalized category entity**, **REST endpoints** for listing and creating categories, and **expense APIs** that reference categories by **id**.

## Goals

1. Persist categories in a new **`categories`** table with a **unique** category name (trimmed).
2. Expose **`GET /api/categories`** for the dropdown and **`POST /api/categories`** to add a category (human choice **A** — no implicit category creation inside `POST /api/expenses`).
3. Change expense **create** and **patch** request bodies to use **`categoryId`** (positive integer) instead of **`category`** string; validate that the id exists (or return a clear error).
4. Return expenses from the API with enough **category** information for the UI (at minimum **category id** + **display name** — exact JSON shape in Design).
5. Provide a **SQL migration path** that preserves existing expense data: backfill **`categories`** from distinct legacy `expenses.category` strings, set **`category_id`**, then **drop** the legacy `category` column (or a documented two-step migration — Design details).
6. Update the **Next.js** app: load categories, render a **dropdown**, support **“add new category”** via **`POST /api/categories`** then select the returned id before **`POST /api/expenses`**.

## Non-Goals

- Auth, per-user category lists, or category delete/edit UI (unless explicitly added later).
- Using **PUT** for category creation (human chose **POST** for create per Option A).
- Server-side auto-creation of categories inside expense create (explicitly out of scope for Option A).

## Human decision (locked for this spec)

| Decision | Choice |
|----------|--------|
| Category creation + expense linkage | **A**: Client **`POST /api/categories`**, then **`POST /api/expenses`** / **`PATCH /api/expenses/:id`** with **`categoryId`**. |

## User Stories / Use Cases

### US-1: List categories

**As a** user, **I want to** see all categories in a dropdown when adding or editing an expense, **so that** I pick a consistent label.

### US-2: Add a category

**As a** user, **I want to** add a new category name if it does not exist, **so that** I can classify a new type of spend without leaving the flow.

### US-3: Create expense with category

**As a** user, **I want to** save an expense linked to a chosen category id, **so that** the ledger stores a FK, not a duplicate string.

### US-4: Edit expense category

**As a** user, **I want to** change an expense’s category via the same dropdown, **so that** corrections stay consistent with the category table.

## Functional Requirements

### FR-1: `categories` table

- Table includes at least: surrogate **`id`** (BIGINT, auto-increment), **`name`** (VARCHAR, **UNIQUE** after trim), **`created_at`** / **`updated_at`** (consistent with `expenses` precision).
- Application trims and validates **name** length (align with prior 128-char category limit unless Design tightens).

### FR-2: `GET /api/categories`

- **200** with `{ success: true, data: { items: Category[] } }` (or equivalent single list key — match project patterns in Design).
- Categories ordered deterministically (e.g. **name ASC**, or **id ASC** — Design).
- Rate-limited like other public routes (existing middleware).

### FR-3: `POST /api/categories`

- Body: **`{ "name": string }`** (trimmed, non-empty, max length per FR-1).
- **201** with created **`Category`** in `data`.
- **409** (or **422** with stable `error.code`) when **name** duplicates an existing row (unique constraint violation mapped to API contract).
- **400** on validation errors.

### FR-4: Expense APIs use `categoryId`

- **`POST /api/expenses`**: body **`description`**, **`amount`**, **`categoryId`** (integer &gt; 0). Remove **`category`** string from the public contract.
- **`PATCH /api/expenses/:id`**: optional **`categoryId`** (same validation); at least one of description / amount / categoryId where applicable (existing “at least one field” rule preserved).
- **404** or **422** when **`categoryId`** does not exist — pick one convention in Design and document in README.
- **`GET`** list/single expense responses include **category identity** for display (join or follow-up query; no N+1 in list — Design).

### FR-5: Data migration

- Existing DBs with `expenses.category` VARCHAR: migration creates **`categories`**, inserts **distinct** trimmed names, adds **`category_id`** to **`expenses`**, backfills FKs, adds FK constraint, **drops** `category` column (or explicit two-phase if zero-downtime needed — default single migration for this MVP).

### FR-6: Web client

- Fetch categories when the expense form (or page) loads; populate **`<select>`** (or accessible combobox pattern).
- **Add category**: user submits new name → **`POST /api/categories`** → on success, **select** the new **`id`** (append to local list) → user completes expense → **`POST /api/expenses`** with **`categoryId`**.
- **Edit mode**: pre-select option matching expense’s category.
- Zod schemas and API client types updated; no `any`.

## Non-Functional Requirements

- **Validation**: All new bodies validated with **zod**; async handlers wrapped; no sensitive logging.
- **SQL**: Parameterized queries only; FK **`ON DELETE`** behavior defined in Design (e.g. RESTRICT vs SET NULL — default **RESTRICT** if delete category is unsupported).
- **Tests**: Integration tests for new routes (happy path + validation + duplicate name + expense with invalid `categoryId`); web tests updated for dropdown behavior where practical.
- **Docs**: `server/README.md` (and web if applicable) updated with new endpoints and breaking change note for expense body.

## Acceptance Criteria

1. No expense API accepts **`category`** as a free string for create/patch; **`categoryId`** is required for create and validated.
2. Dropdown only offers categories from **`GET /api/categories`** plus the flow to add a new one via **`POST /api/categories`**.
3. Duplicate category names are rejected with a documented status and **`error.code`**.
4. Legacy data migrates without orphan expenses; CI or local migration instructions run cleanly.

## Open Points for Design (not blocking spec approval)

- Exact **`Category`** and **`Expense`** JSON shapes (nested `category` object vs flat `categoryId` + `categoryName`).
- Whether **`GET /api/expenses`** uses SQL `JOIN` or a two-query pattern.

## Human Approval Status

- [x] Spec reviewed by human developer
- [x] Ready to proceed to Design phase
