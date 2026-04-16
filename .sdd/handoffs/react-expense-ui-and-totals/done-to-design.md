# Handoff: react-expense-ui-and-totals — post-DONE rework → design

## Trigger

Human requested **Material UI (MUI)** as the frontend library (`/sdd-request-rework`).

## State

- **Current phase:** `design` (`status`: `rework_design`)
- **Approved phases:** `idea`, `spec` only
- **Invalidated:** prior **design**, **tasks**, **implementation** completion, and **validation** approval (see `.sdd/state/react-expense-ui-and-totals.json`)

## What the next agent must do

1. **Revise** `.sdd/workspace/react-expense-ui-and-totals/current/design.md` to specify MUI (`@mui/material`, Emotion, Next.js App Router integration, theming, component mapping from current screens).
2. **Re-draft** `tasks.md` (and plan if used) so implementation work reflects MUI migration and test updates.
3. **Re-run** implementation in `web/` per updated tasks, then **validation** and human approval.

## Constraints (from rework feedback)

- Prefer **one** UI system (MUI); avoid long-term Tailwind + MUI duplication unless a short transitional note is documented.
- Preserve **behavior**, **a11y**, and **MSW + RTL** coverage; update tests for MUI DOM/selectors as needed.

## Evidence

- Full feedback: `rework_history[0].feedback` in `.sdd/state/react-expense-ui-and-totals.json`
