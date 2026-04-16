# Summary: spec — react-expense-ui-and-totals

## Phase

spec

## What Was Produced

- Artifact: `.sdd/workspace/react-expense-ui-and-totals/current/spec.md`
- **List + pagination** using `GET /api/expenses` (`limit` default 20, `offset`, display API **`total`** row count).
- **CRUD UI:** `POST`, `GET :id`, `PATCH`, `DELETE` with confirmations, loading/errors, empty states.
- **Forms:** **zod** + **react-hook-form**; **amount** as string toward API; decimal-safe summing (**design** picks library/pattern).
- **Totals:** **Grand total** = sum of all `amount` values (all DB rows), **preferred** via **paginated GET** (`limit=100`) until all rows fetched—**no new API** for MVP; **page subtotal** for current `items`.
- **Config:** API base URL via env (name in **design**).
- **Tests:** RTL + MSW; no real network in tests.

## Key Decisions

1. **Grand total** without new endpoints: **multi-fetch** pagination sum is the MVP path; optional aggregate endpoint explicitly **deferred**.
2. **Next vs Vite** not locked in spec—**design** decides; Next defaults to Server Components where possible.
3. **Delete** handles **204** no body.

## Risks / Open Issues

- **Large `total`**: multi-fetch may be slow—spec allows **design** to add UX warning threshold.
- **Concurrent edits** during sum: minor mismatch acceptable for MVP.

## What the Next Agent Must Know

- **Architecture / design:** app folder layout, **Next vs Vite**, Tailwind/CSS approach, **decimal** library choice, **API client** module boundaries (services vs components), CORS notes for README, and **MSW** test setup location.
