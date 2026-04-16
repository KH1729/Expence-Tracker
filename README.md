# Expense Tracker (expense-tracker-web)

Personal expense tracking: **Node.js + TypeScript** API, **Next.js + React** web client, **MySQL** database.

## Repository layout

- **`server/`** — Express API, MySQL pool, migrations (see [`server/README.md`](server/README.md)).
- **`web/`** — Next.js App Router UI (see [`web/README.md`](web/README.md)).

## Quick start (API only)

1. Install MySQL and create a database.
2. Run the migration in `server/migrations/` (instructions in `server/README.md`).
3. `cd server && cp .env.example .env` — fill in MySQL credentials.
4. `npm install && npm run dev`
5. Open `GET http://localhost:4000/health` (default port).

## Quick start (API + web)

1. **Terminal A — API:** follow the steps above so the API listens on `http://localhost:4000` (default).
2. **Terminal B — web:** `cd web && cp .env.local.example .env.local` (adjust `NEXT_PUBLIC_API_BASE_URL` if needed), then `npm install && npm run dev`.
3. Open the URL shown by Next.js (typically `http://localhost:3000`).

CORS: the browser calls the API from the Next.js origin. Ensure the Express app allows that origin (see `server` configuration / CORS middleware).

## Environment

- Server env files: **`server/.env`** (gitignored). Use **`server/.env.example`** as a template.
- Web env: **`web/.env.local`** (gitignored). Copy from **`web/.env.local.example`**.

## SDD

Feature specs and state live under **`.sdd/`** (Spec-Driven Development artifacts).
