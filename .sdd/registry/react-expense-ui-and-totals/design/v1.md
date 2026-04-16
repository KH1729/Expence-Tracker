# Design: React expense UI and totals

## Design Summary

Add a **Next.js (App Router)** app under **`web/`** at the repo root, using **TypeScript**, **Tailwind CSS**, and **react-hook-form** + **zod** for forms. A thin **`expenseApi`** service wraps **`fetch`** against **`NEXT_PUBLIC_API_BASE_URL`** + `/api/expenses`, returning typed JSON or mapped errors. **UI logic** lives in hooks (`useExpenseList`, `useExpenseMutations`, `useGrandTotalSum`) under **`hooks/`**; **money** sums use **integer cents** in **`lib/money.ts`** (no extra decimal library). The main dashboard is a **client** route component (`app/page.tsx` with `"use client"`) because pagination, dialogs, and optimistic flows need browser state—documented with a one-line justification. **Grand total** runs **after** the first list paint: loop **`GET`** with **`limit=100`** until all rows are loaded, then sum in cents. **Page subtotal** derives from the current page’s `items`. **MSW** wires into **Vitest + RTL** for component tests.

## Architecture Impact

- **Impact level:** high (new **`web/`** app; root may add workspace scripts).
- **New components:** Next app, API client, schemas, money helpers, hooks, presentational components, MSW handlers.
- **Modified:** Root **`README.md`** (dev: two processes + CORS); optional **root `package.json`** workspaces—**minimal**: document `cd web && npm run dev` without forcing npm workspaces in MVP.

## Components / Modules Affected

| Component | Change Type | Description |
|-----------|-------------|-------------|
| `web/package.json` | new | Next.js 15+, React 19, tailwind, rhf, zod, @hookform/resolvers, vitest, RTL, msw |
| `web/next.config.ts` | new | Strict TS; `env` exposure for `NEXT_PUBLIC_API_BASE_URL` |
| `web/app/layout.tsx` | new | Root layout, metadata, global styles |
| `web/app/page.tsx` | new | **Client** dashboard shell — `"use client"` — wires hooks + sections |
| `web/src/services/expenseApi.ts` | new | `list`, `getById`, `create`, `patch`, `remove` — parses `{ success, data \| error }` |
| `web/src/schemas/expense.ts` | new | Zod: create/patch shapes aligned with API |
| `web/src/lib/money.ts` | new | `parseAmountToCents`, `sumCents`, `formatCents` — **no `any`** |
| `web/src/lib/logger.ts` | new | Dev-only debug or no-op in production (**no `console.log`** in prod) |
| `web/src/hooks/useExpenseList.ts` | new | Pagination state, list fetch, error/retry |
| `web/src/hooks/useExpenseMutations.ts` | new | create/update/delete + invalidate list |
| `web/src/hooks/useGrandTotalSum.ts` | new | Multi-page fetch with `limit=100`, loading/error |
| `web/src/components/ExpenseTable.tsx` | new | Table + actions |
| `web/src/components/ExpenseForm.tsx` | new | Shared create/edit (mode prop) |
| `web/src/components/DeleteExpenseDialog.tsx` | new | Confirm + delete |
| `web/src/components/SummaryBar.tsx` | new | Row count, page subtotal, grand total states |
| `web/src/mocks/handlers.ts` | new | MSW handlers for `/api/expenses` |
| `web/README.md` | new | Env vars, CORS note, scripts |
| Root `README.md` | modified | Point to `web/` and dual-server dev |

**Dependency direction:** `components` → `hooks` → `services` / `lib` — **services** do not import components.

## Interfaces / APIs (client → server)

Uses existing **expense-crud-api** contract. Client adds:

### expenseApi.list

- **Input:** `{ limit: number; offset: number }`
- **Output:** `{ items: Expense[]; total: number }` from `data`
- **Errors:** Throw or `Result` type with `code` / `message` from JSON body

### expenseApi.remove

- **204:** No JSON — treat as success without parsing body.

### Environment

- **`NEXT_PUBLIC_API_BASE_URL`**: e.g. `http://localhost:3001` (no trailing slash); client builds URLs with `new URL(\`/api/expenses\`, base)`.

## Data Flow

1. **Dashboard mount** → `useExpenseList` fetches page 0 / default limit 20.
2. **`useGrandTotalSum`** starts after first successful list response (has `total`): loops `list({ limit: 100, offset })` until cumulative `items.length` matches `total` from first response; sums **`amount`** via **cents**.
3. **Create** → POST → refetch list + **restart** grand-total sequence (or invalidate).
4. **Patch/Delete** → same refetch strategy; on delete, adjust offset if page empty.

## Data Model / Schema Changes

| Entity | Change | Notes |
|--------|--------|-------|
| API / DB | none | Client-only feature |

## Security Considerations

- Only **`NEXT_PUBLIC_*`** for browser-visible config; no API keys in client.
- **CORS:** Express must allow **`web`** origin (e.g. `http://localhost:3000`).

## Observability Considerations

- Client **logger** no-op or dev-only; no PII in logs.

## Testing Strategy

- **Unit:** `money.ts` (parse, sum, format edge cases).
- **Component (RTL):** empty list, validation error on submit, delete confirm.
- **MSW:** mock list/create/404/validation; **no** live server in unit tests.

## Rollout / Migration Notes

- New app: **`cd web && npm install && npm run dev`** alongside **`server`**.
- Optional later: npm **workspaces** or Turborepo—out of scope for MVP.

## Risks / Tradeoffs

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Large `total` slows grand sum | medium | UX lag | Staggered load UI; optional warning if `total > 500` (spec open question) |
| Float misuse | low | Wrong cents | Centralize **only** in `money.ts` |

## Human Approval Status

- [x] Design reviewed by human developer
- [x] Ready to proceed to Plan / Tasks phase
