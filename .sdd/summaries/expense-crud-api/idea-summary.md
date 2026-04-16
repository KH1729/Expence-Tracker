# Summary: idea — expense-crud-api

## Phase

idea

## What Was Produced

- Artifact: `.sdd/workspace/expense-crud-api/current/idea.md`
- Defines **REST-style CRUD** for the existing **`expenses`** table (list, get by id, create, update, delete), aligned with **Express + mysql2 + zod + pino** and the approved **database-and-server-foundation** schema (numeric id, DECIMAL amount, VARCHAR category).
- Explicit **out of scope**: multi-tenant auth (unless later added), category tables, attachments, frontend.
- **Assumptions** flag auth/tenancy and amount sign rules for resolution in **spec**.

## Key Decisions

1. **Scope** is HTTP CRUD only against the existing `expenses` table—no new tables in the idea phase.
2. **Pagination / partial update** details are deferred to **spec** to avoid locking UX without product input.
3. **Auth** is called out as needing human confirmation if not already in the server.

## Risks / Open Issues

- Without auth, CRUD may be **too open** if the server is exposed—spec must state security posture (public API vs internal-only vs future auth).

## What the Next Agent Must Know

- After **idea approval**, draft **spec.md** with exact routes, request/response shapes, **pagination**, **update semantics** (PUT vs PATCH), idempotency expectations, and **error codes** for not-found and validation failures.
