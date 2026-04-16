# Idea: React expense UI and totals

## Raw Request

`/sdd-build-feature react-expense-ui-and-totals`

## Normalized Summary

Add a **React-based client** for the Expense Tracker that calls the existing **`/api/expenses`** REST API, lets users **list, create, edit, and delete** expenses, and surfaces **totals** (aggregate amount insight—not only pagination metadata) so users see spending at a glance.

## Initial Scope

- **Expense list** with pagination aligned to API `limit` / `offset` and **`total` row count** from the list response.
- **Create / edit / delete** flows with validation aligned to API rules (description, amount, category; positive decimal amounts; trimmed strings).
- **Totals UX:** show at least one clear **sum of amounts** (exact definition—e.g. all loaded rows vs. global sum—left to spec to pin down; may require client-side aggregation or a small API extension).
- **Configuration** for API base URL (e.g. env) so dev/prod targets stay flexible.
- **Accessible, coherent UI** consistent with project React/Next and styling conventions once chosen in design.

## Out of Scope

- **Authentication / multi-user** (matches current API: no auth).
- **New backend resources** unless spec explicitly approves a minimal addition for global totals (e.g. `SUM(amount)` endpoint)—default assumption is **prefer no DDL/API change** for MVP.
- **Mobile native apps**, offline-first sync, or attachments.
- **Internationalization** beyond a single default locale for dates/numbers (unless trivial).

## Assumptions

- **`expense-crud-api`** (or equivalent) is **available** in the target environment with CORS allowing the web origin.
- The repository may **gain a new frontend package or app** (there is currently **no** React app at repo root—only `server/`).
- **“Totals”** means **monetary sum(s)** of `amount` fields, not only the list **`total` count** from the API.

## Constraints

- Must follow project rules: **zod** where forms validate; **no `any`**; **structured logging** on server only (client: no `console.log` in production code per rules).
- UI stack should align with **React / Next.js** workspace rules; exact choice (**Vite + React** vs **Next.js App Router**) is a **design** decision.

## Human Approval Status

- [x] Idea reviewed by human developer
- [x] Scope confirmed
- [x] Ready to proceed to Spec phase
