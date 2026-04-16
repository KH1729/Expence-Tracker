# Summary: design — react-expense-ui-and-totals

## Phase

design

## What Was Produced

- Artifact: `.sdd/workspace/react-expense-ui-and-totals/current/design.md`
- **Stack:** **Next.js App Router** app in **`web/`**, **Tailwind**, **react-hook-form** + **zod**, **fetch**-based **`expenseApi`** service.
- **Money:** **integer cents** in **`lib/money.ts`** (no new decimal dependency).
- **Hooks:** list pagination, mutations, **grand total** multi-fetch (`limit=100`).
- **Main route:** **`app/page.tsx`** as **client** dashboard (interactive ledger)—one-line **`use client`** justification in file.
- **Env:** **`NEXT_PUBLIC_API_BASE_URL`** (documented in `web/README.md`).
- **Tests:** Vitest, RTL, MSW; unit tests for **`money`**.

## Key Decisions

1. **`web/`** folder name for the Next app.
2. **No** npm workspaces at repo root for MVP—document two dev servers instead.
3. **Grand total** refetch after mutations for simplicity (acceptable MVP).

## Risks / Open Issues

- **CORS** must be set on Express for the Next dev origin.

## What the Next Agent Must Know

- **Work Manager** should split tasks: scaffold **`web/`**, **`expenseApi` + types**, **`money` + tests**, hooks, components, page integration, MSW + RTL, README/CORS docs.
