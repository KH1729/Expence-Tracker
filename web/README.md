# Expense Tracker — web (Next.js)

React **App Router** client for the Expense Tracker API. Expenses use **`categoryId`** on create/update; **`GET`** responses include nested **`category: { id, name }`**. Use **`GET/POST /api/categories`** to list or create categories before posting an expense.

## Prerequisites

- **Node.js 20+** (recommended)
- API running with CORS allowing this origin (see root [`README.md`](../README.md))

## Setup

```bash
cd web
npm install
cp .env.local.example .env.local
```

Edit **`.env.local`**:

- `NEXT_PUBLIC_API_BASE_URL` — base URL of the API (no trailing slash), e.g. `http://localhost:4000`.

If unset, `next.config.ts` defaults to `http://localhost:4000` for local builds.

## Scripts

| Script            | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Next.js dev server (default port 3000)           |
| `npm run build`   | Production build                                 |
| `npm run start`   | Start production server                          |
| `npm run test`    | Vitest (unit + component tests, MSW-mocked API)  |
| `npm run test:watch` | Vitest watch mode                             |
| `npm run lint`    | `next lint` (ESLint via Next.js)                 |

## Architecture (high level)

- **`src/services/expenseApi.ts`** — `fetch` client for expenses.
- **`src/services/categoryApi.ts`** — `fetch` client for `/api/categories`.
- **`src/hooks/`** — List, mutations, and grand-total pagination.
- **`src/components/ExpenseDashboard.tsx`** — Main screen wiring table, forms, delete dialog.
- **`src/mocks/`** — MSW handlers used in tests (Vitest `setupFiles`).

## API contract

Responses follow `{ success: true, data: … }` or `{ success: false, error: { code, message } }` as implemented in `server/`.
