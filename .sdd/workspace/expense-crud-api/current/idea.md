# Idea: Expense CRUD API

## Raw Request

User invoked `/sdd-build-feature expense-crud-api` to drive the SDD pipeline for a feature that exposes create, read, update, and delete operations for expenses over the existing Express + MySQL stack.

## Normalized Summary

Add authenticated HTTP endpoints (or public MVP scope—see assumptions) that let clients list, retrieve, create, update, and delete **expense** rows in the existing `expenses` table, using the project’s **zod** validation, **asyncHandler** / error JSON contract, and **mysql2** pool. Behavior and field rules align with the approved **database-and-server-foundation** schema (numeric `id`, `description`, `amount` as DECIMAL, `category` VARCHAR, timestamps).

## Initial Scope

- **List** expenses with sensible defaults (e.g. pagination or limit/offset—specified in spec).
- **Get** one expense by primary key (`id`).
- **Create** an expense with required/optional fields per schema.
- **Update** an expense (full or partial—decided in spec).
- **Delete** an expense by `id`.
- **Validation** of request bodies and params with **zod**; consistent `{ success, data }` / `{ success, error }` responses and correct HTTP status codes.
- **Integration** with existing `server/` patterns: Express app, pool, error handler, structured logging (no `console.log` in production paths).

## Out of Scope

- Multi-user auth / tenancy (unless already present in the codebase—treat as follow-up unless spec says otherwise).
- Category management as a separate resource or lookup table (category stays a string on `expenses`).
- File uploads, receipts, or attachments.
- Frontend UI for expenses (separate feature).
- Bulk import/export or reporting beyond single-row CRUD.

## Assumptions

- The **`expenses`** table and **`GET /health`** foundation from **database-and-server-foundation** exist or will exist before implementation.
- **IDs** are numeric (`BIGINT` auto-increment) as in the design.
- **Currency** is a single logical currency per row; `amount` is validated as a positive decimal unless product decides zero/negative is allowed (spec will clarify).
- If **no auth** exists yet, this feature may ship as **same-origin / trusted server** only or with a **placeholder** auth boundary—human must confirm in spec approval.

## Constraints

- Must follow workspace rules: Express middleware order, zod on bodies, **no unhandled rejections**, pino (or existing logger) in routes.
- Must not log secrets or full PII.
- Prefer **editing existing** `server/` layout over new frameworks.

## Human Approval Status

- [x] Idea reviewed by human developer
- [x] Scope confirmed
- [x] Ready to proceed to Spec phase
