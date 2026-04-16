# Spec: React expense UI and totals

## Background / Context

The **expense-crud-api** feature exposes **`/api/expenses`** with list (pagination + row **`total`**), get-by-id, create, patch, and delete. The repository currently has **no** frontend app. This feature adds a **browser UI** so users can manage expenses and see **monetary totals** alongside pagination metadata.

## Problem Statement

Without a client, the API is unusable for end users; without **totals**, users cannot see aggregate spending at a glance.

## Goals

1. **List** expenses with **newest-first** order (inherited from API), **pagination** using `limit` / `offset` and the response **`total`** row count.
2. **Create**, **edit** (partial fields), and **delete** expenses with **client validation** aligned to API rules before submit.
3. Show **monetary totals**: at minimum **sum of `amount` for all rows in the database** (see FR-10), without requiring new DDL.
4. **Configurable API base URL** for dev/staging/prod.
5. **Accessible** primary flows (keyboard, labels, errors perceivable).

## Non-Goals

- Authentication, sessions, or multi-tenancy.
- New backend tables or changing **`expenses`** DDL **in this feature** (optional **single read-only aggregate endpoint** is allowed only if FR-10 cannot be met without it—see FR-10).
- Offline mode, attachments, multi-currency, or exports.
- Full i18n (single locale for number/date formatting is acceptable).

## User Stories / Use Cases

### US-1: Browse expenses

**As a** user, **I want to** see a paginated list of my expenses with newest first, **so that** I can scan recent activity.

### US-2: Add an expense

**As a** user, **I want to** enter description, amount, and category and save, **so that** a new expense appears in the list.

### US-3: Edit an expense

**As a** user, **I want to** change one or more fields on an existing row, **so that** corrections do not require delete-and-recreate.

### US-4: Delete an expense

**As a** user, **I want to** remove an expense by id, **so that** mistakes can be cleared.

### US-5: See totals

**As a** user, **I want to** see **how much I have spent in total** (all stored expenses), **so that** I understand aggregate spending—not only how many rows exist.

## Functional Requirements

### FR-1: API contract

- Consume **`/api/expenses`** as specified in **expense-crud-api** (camelCase **`Expense`**, success/error shapes, status codes).
- **Base URL** from configuration (environment variable name is a **design** choice; must be documented).

### FR-2: List view

- **Fetch** `GET /api/expenses?limit=&offset=` with **`limit`** default **20** (within **1–100**).
- Display **`items`**: `description`, **`amount`** (display as decimal using the string value), **`category`**, **`createdAt`** (human-readable in default locale).
- **Pagination:** show current range (e.g. “Showing 1–20 of **total**”) using API **`total`** (row count).
- **Prev / Next** (or page controls) that adjust **`offset`** by **`limit`** without exceeding bounds.
- **Loading** and **error** states for the list request; **retry** affordance on failure.
- **Empty state** when `items.length === 0` and success.

### FR-3: Create expense

- Form fields: **`description`**, **`amount`**, **`category`** with rules matching API (lengths, strictly positive amount, max 2 decimal places).
- **Submit** → `POST /api/expenses` with JSON body; on **`201`**, refresh list (or merge) so the new row appears.
- Show API **`VALIDATION_ERROR`** (and other errors) **message** to the user without raw stack traces.

### FR-4: Edit expense

- **Load** row via `GET /api/expenses/:id` when opening the edit flow, or use list row data if sufficient.
- **Submit** changed fields only → `PATCH /api/expenses/:id`; reject submit if body would be empty.
- On success, refresh affected data.

### FR-5: Delete expense

- **Confirm** destructive action (dialog or equivalent).
- **`DELETE /api/expenses/:id`**; handle **`204`** with **no body**; on success, remove from UI and/or refetch list; adjust pagination if current page becomes empty.
- **`404`**: show not-found feedback.

### FR-6: Client validation (zod + forms)

- Use **zod** schemas mirroring API constraints for **`POST`** / **`PATCH`** payloads (trim strings, amount rules).
- Use **react-hook-form** (or equivalent per design) with **zod resolver**—no ad-hoc multi-`useState` form state.

### FR-7: Amount handling

- Treat **`amount`** as **string** in logic that touches API payloads; parse to **decimal** for summing (avoid binary float corruption for display/totals math—use **decimal-safe** approach in implementation, e.g. integer cents or a decimal library—**design** picks).

### FR-8: Errors from API

- Map **`success: false`** to user-visible messages; **`401`/`403`** not expected in MVP but handle generically if returned.

### FR-9: CORS / deployment

- Document that the **API** must allow the **web origin** via existing server CORS configuration.

### FR-10: Monetary totals (all-time sum)

- The UI MUST show **Total spent (all expenses)** = sum of **`amount`** over **all** rows in the database (same semantic as summing every row’s `amount`).
- **Preferred implementation (no new API):** compute by **paginating** `GET /api/expenses` with **`limit = 100`** (max allowed) until all rows are fetched (`offset` increases until cumulative items ≥ **`total`** from the first response), then sum **`amount`** with decimal-safe arithmetic.
- **Optional escape hatch:** if product later rejects multi-request totals, a **single** additive endpoint (e.g. `GET /api/expenses/meta` returning `{ sumAmount }`) may be introduced in a **separate** backend task—**out of scope for this spec’s MVP** unless implementation proves infeasible; this spec assumes **multi-fetch sum is acceptable** for MVP data sizes.
- While the global sum is loading, show a **loading** indicator; on failure, show **error** and retry.
- Additionally show **Page subtotal** = sum of **`amount`** for **`items`** currently displayed (helps reconcile with partial pages).

## Non-Functional Requirements

### NFR-1: Performance (MVP)

- List interaction should remain responsive; **grand total** fetch may run **after** first page paint (staggered).

### NFR-2: Accessibility

- Form controls **labeled**; destructive action **confirmable**; focus management for dialogs **reasonable** (design details).

### NFR-3: Security

- **No secrets** in client bundle except **`NEXT_PUBLIC_` / public** config for API base URL.
- **No `console.log`** in production build (use project logger pattern if client logging is required).

### NFR-4: Testing

- **RTL** tests for critical behavior (empty list, validation message, delete confirmation—not implementation trivia).
- **MSW** (or equivalent) for API mocking in tests—**no** real HTTP to server in unit/component tests.

## Constraints

- **TypeScript strict**; **no `any`**.
- **Server Components default** if using Next.js App Router; **`use client`** only where needed with a one-line justification comment per project rules.
- Align styling with **Tailwind** or project standard once chosen in design.

## Assumptions

- Total row count **`total`** from list is **accurate** and stable during a short multi-fetch sum (concurrent edits may cause slight mismatch—acceptable for MVP).

## Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| `total === 0` | Grand total **0**; empty list state |
| Delete last item on page | Move to previous page if needed; no error |
| PATCH empty body | Blocked in UI (never send) |
| API returns **400** validation | Inline / summary message from **`error.message`** |
| Sum fetch interrupted | Partial failure message; retry |
| **Very large `total`** | May be slow; **design** may add a soft warning above threshold (optional) |

## Acceptance Criteria

- [ ] User can paginate through expenses using API **`limit`**/**`offset`** and sees **row `total`** from API.
- [ ] User can **create** an expense; list updates; validation matches API rules.
- [ ] User can **edit** and **delete** with confirmation on delete.
- [ ] **Grand total** (all rows) and **page subtotal** are visible and update after mutations.
- [ ] Forms use **zod** + **react-hook-form** (or approved equivalent).
- [ ] No **`any`**; production client code has **no** raw **`console.log`**.
- [ ] Tests cover at least one happy path and one validation/error path per major flow (per project testing rules).

## Open Questions

1. Exact **env var name(s)** and whether the app lives under **`web/`** vs **`client/`**—**design**.
2. Whether to add a **threshold** (e.g. warn if `total > 500`) before running full multi-fetch sum—**design/UX**.

## Human Approval Status

- [x] Spec reviewed by human developer
- [x] Ready to proceed to Design phase
