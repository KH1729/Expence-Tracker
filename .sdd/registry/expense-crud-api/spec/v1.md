# Spec: Expense CRUD API

## Background / Context

The **database-and-server-foundation** feature delivered the `expenses` MySQL table, pooled access, and **`GET /health`**. This feature adds **REST endpoints** so clients can manage expense rows using the same Express app, **zod** validation, **asyncHandler**, and the project’s JSON success/error contract.

## Problem Statement

Without CRUD APIs, no client or integration can create, read, update, or delete expenses; the schema and server would remain unused for core product behavior.

## Goals

1. Expose **list** and **single-row read** for `expenses` with predictable pagination and sorting.
2. Expose **create**, **partial update**, and **delete** for a single expense by primary key.
3. Validate all inputs with **zod**; use **parameterized SQL** only; return correct HTTP status codes and `{ success, data }` / `{ success, error }` shapes.
4. Keep **authentication and multi-tenancy out of scope** for this feature (see Non-Goals); rely on existing **CORS**, **helmet**, and **rate limiting** from the foundation.

## Non-Goals

- User accounts, JWT/session auth, or row-level tenancy.
- Separate **category** resource or validation against a fixed enum (category remains a free-form string stored in `expenses.category`).
- Attachments, multi-currency fields, or tax line items.
- GraphQL, bulk create/delete, or CSV import/export.
- Changing the **`expenses`** DDL (unless a spec-approved migration is required for indexes only—prefer none in this feature).

## User Stories / Use Cases

### US-1: List expenses

**As a** client developer, **I want to** retrieve a page of expenses with newest first, **so that** I can show a ledger or feed without loading the full table.

### US-2: View one expense

**As a** client developer, **I want to** fetch one expense by id, **so that** I can show detail or pre-fill an edit form.

### US-3: Create an expense

**As a** client developer, **I want to** submit description, amount, and category, **so that** a new row is stored with server-generated id and timestamps.

### US-4: Update an expense

**As a** client developer, **I want to** send only changed fields, **so that** I can patch labels or amounts without a full replace.

### US-5: Delete an expense

**As a** client developer, **I want to** delete by id, **so that** mistaken or obsolete rows can be removed.

## Functional Requirements

### FR-1: Resource and base path

- Base path: **`/api/expenses`** (all methods below are relative to this path).
- **Plural** resource name; **numeric** `id` in path: **`/api/expenses/:id`** where `:id` is a **decimal integer string** in the range of **`BIGINT UNSIGNED`** (no UUID).

### FR-2: List — `GET /api/expenses`

- **Query parameters:**
  - **`limit`**: optional, integer **1–100**, default **20**.
  - **`offset`**: optional, integer **≥ 0**, default **0**.
- **Ordering:** **`created_at` descending** (newest first), then **`id` descending** as a stable tie-breaker.
- **Response `200`:** `{ "success": true, "data": { "items": Expense[], "total": number } }` where **`total`** is the **count of all rows** in `expenses` (same filters as this endpoint—currently none), for UI pagination. If **full-table count** is too costly for a later scale, a follow-up feature may add caching; for this spec, a single `COUNT(*)` query is acceptable.
- **Invalid query:** **`400`** with error code **`VALIDATION_ERROR`** (see Error contract).

### FR-3: Get one — `GET /api/expenses/:id`

- **Response `200`:** `{ "success": true, "data": { "expense": Expense } }`.
- **Unknown id:** **`404`** with **`NOT_FOUND`** (same shape as existing not-found middleware).

### FR-4: Create — `POST /api/expenses`

- **Request body (JSON):**
  - **`description`**: string, **required**, **trimmed**, length **1–512** (matches `VARCHAR(512)` intent).
  - **`amount`**: string **or** number in JSON; validated as a **strictly positive** decimal with **at most 2** fractional digits; stored as **`DECIMAL(10,2)`** (reject values outside representable range with **`422`** or **`400`** per Error contract).
  - **`category`**: string, **required**, **trimmed**, length **1–128**.
- **Response `201`:** `{ "success": true, "data": { "expense": Expense } }` with **`Location`** header optional (nice-to-have, not required for acceptance).
- **`created_at` / `updated_at`:** set by DB defaults; response must echo stored values.

### FR-5: Partial update — `PATCH /api/expenses/:id`

- **Request body (JSON):** object with **one or more** optional keys: **`description`**, **`amount`**, **`category`** (same validation rules as create when present). Omitted keys unchanged.
- **Empty object:** **`400`** **`VALIDATION_ERROR`** (no-op updates not allowed).
- **Response `200`:** `{ "success": true, "data": { "expense": Expense } }`.
- **Unknown id:** **`404`** **`NOT_FOUND`**.

### FR-6: Delete — `DELETE /api/expenses/:id`

- **Response `204`:** **no body** on success.
- **Unknown id:** **`404`** **`NOT_FOUND`** with JSON body (consistent with how **`404`** is returned elsewhere; if middleware always sends JSON for unknown routes only, implementation may return JSON **`404`** for missing id—must still be **`NOT_FOUND`**).

### FR-7: Expense JSON shape (`Expense`)

| Field | Type | Notes |
|-------|------|--------|
| `id` | number | Safe integer in JSON; fits `BIGINT` for this product |
| `description` | string | |
| `amount` | string | **Two** decimal places as a string (e.g. `"10.50"`) to avoid float ambiguity |
| `category` | string | |
| `createdAt` | string | ISO 8601 UTC |
| `updatedAt` | string | ISO 8601 UTC |

- **Naming:** **camelCase** in JSON for API; DB columns remain **snake_case** (`created_at`, `updated_at`) with explicit mapping in implementation.

### FR-8: Data access

- All SQL **parameterized** (prepared statements / placeholders). No string concatenation of user input into SQL.
- Use the existing **mysql2** pool from the foundation.

### FR-9: Router placement

- Register **`/api/expenses`** **before** **`notFoundHandler`** and **before** **`createErrorHandler`** in the Express app (same pattern as health).

## Non-Functional Requirements

### NFR-1: Validation

- Parse **`POST`** and **`PATCH`** bodies with **zod** before DB access; map zod failures to **`400`** **`VALIDATION_ERROR`** with a **safe** `message` (no stack traces in body).

### NFR-2: Async and errors

- All async route handlers use **`asyncHandler`**; domain errors (e.g. not found) may use **typed errors** or **central mapping** so the default handler does not mask **`404`** as **`500`**.

### NFR-3: Logging

- Use **pino**; log ids and operation names at **info**; **error** for failures; **never** log passwords or full connection strings.

### NFR-4: Security (MVP)

- **No auth** in this feature: endpoints are **as protected as the deployed network** allows. Document in **design/README** that production exposure requires **future auth** or **network restrictions**.

## Constraints

- Stack: **Node**, **TypeScript**, **Express**, **mysql2**, **zod**, **pino**, existing middleware order (**cors → helmet → rateLimit → json → routes → notFound → errorHandler**).
- Table **`expenses`** as in **`server/migrations/001_create_expenses.sql`** (foundation).

## Assumptions

- Single logical **currency**; `amount` is strictly **positive** for creates/updates (no refunds line item in this spec).
- Concurrent updates: **last write wins** for **`PATCH`** (no optimistic locking).

## Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| `:id` not a positive integer | **`400`** **`VALIDATION_ERROR`** |
| `:id` valid but row missing | **`404`** **`NOT_FOUND`** |
| `amount` with more than 2 decimal places | **`400`** **`VALIDATION_ERROR`** |
| `amount` ≤ 0 on create/patch | **`400`** or **`422`** **`VALIDATION_ERROR`** (implementation picks one and documents) |
| `PATCH` with only whitespace after trim | **`400`** **`VALIDATION_ERROR`** |
| DB down during request | **`503`** or surface pool error as **`500`** **`INTERNAL_ERROR`** without leaking details (prefer **503** if connectivity known) |

## Error contract (additive)

- **`VALIDATION_ERROR`:** **`400`** (or **`422`** for semantic “understood but invalid”—pick **one** globally in design; default **400** for this spec).
- **`NOT_FOUND`:** **`404`**
- **`INTERNAL_ERROR`:** **`500`** (unexpected)

Success shape remains **`{ success: true, data: T }`**; error shape **`{ success: false, error: { code, message } }`**.

## Acceptance Criteria

- [ ] **`GET /api/expenses`** returns paginated **`items`** and **`total`**; respects **`limit`** / **`offset`** bounds.
- [ ] **`GET /api/expenses/:id`** returns **`200`** or **`404`** appropriately.
- [ ] **`POST /api/expenses`** creates a row and returns **`201`** with **`Expense`** including **`amount`** as two-decimal string.
- [ ] **`PATCH /api/expenses/:id`** updates only provided fields; **`404`** when missing.
- [ ] **`DELETE /api/expenses/:id`** returns **`204`** when deleted; **`404`** when missing.
- [ ] Invalid payloads return **`VALIDATION_ERROR`** without SQL or stack in the response body.
- [ ] Integration tests cover **happy paths** and at least **one** validation and **one** not-found case per method group (minimum agreed in design).

## Open Questions

1. **`COUNT(*)`** on every list: acceptable for MVP; revisit if table grows large (design may note index-only or approximate later).
2. **Location header** on **`POST`**: optional; not blocking.
