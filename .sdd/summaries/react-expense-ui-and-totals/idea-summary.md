# Summary: idea — react-expense-ui-and-totals

## Phase

idea

## What Was Produced

- Artifact: `.sdd/workspace/react-expense-ui-and-totals/current/idea.md`
- **Scope:** React client for **CRUD** on **`/api/expenses`**, pagination using existing **`total`** count, plus **amount totals** UX (how global sums are computed—client vs. optional API—**open for spec**).
- **Repo note:** No frontend exists yet; this feature likely **adds** a React/Next app alongside `server/`.
- **Explicit out of scope:** auth, attachments, i18n depth, new backend unless spec approves for totals.

## Key Decisions

1. **Feature name** `react-expense-ui-and-totals` maps to **UI + aggregates**, not only pagination metadata.
2. **API base URL** must be **configurable** for environments.
3. **Default bias:** avoid backend changes for MVP; **spec** must resolve **global sum** vs. **page sum** and acceptance criteria.

## Risks / Open Issues

- **Global monetary total** may need **all rows** or a **new read-only aggregate endpoint**—tradeoff between API churn and UX accuracy.
- **CORS** must allow the web app origin against the Express server.

## What the Next Agent Must Know

- **Spec Agent** should bind: framework choice constraints, **totals** definition and data source, error handling for API contract (`success` / `error`), and acceptance tests (RTL/MSW patterns per project rules).
