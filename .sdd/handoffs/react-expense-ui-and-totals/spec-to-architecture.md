# Handoff: Spec Agent → Architecture Agent

## Feature

react-expense-ui-and-totals

## From

Spec Agent

## To

Architecture Agent (Design)

## Completed Work

- Artifact: `.sdd/workspace/react-expense-ui-and-totals/current/spec.md`
- Summary: `.sdd/summaries/react-expense-ui-and-totals/spec-summary.md`

## Key Decisions

1. **Totals:** **Grand total** by **client-side** iteration over paginated list API (`limit=100`) unless later a dedicated aggregate endpoint is added elsewhere.
2. **Stack constraints:** **zod**, **react-hook-form**, **TypeScript strict**, **RTL + MSW** for tests.
3. **Framework:** **Next.js App Router vs Vite + React** remains a **design** decision; spec requires Server Components default if Next.

## Constraints to Preserve

- API contract from **expense-crud-api** unchanged in this feature (no required new routes for MVP).
- **No auth**; **no `any`**; **no `console.log`** in production client code.
- **Clean architecture** direction: UI → hooks/lib → services for HTTP.

## Risks / Open Issues

- Performance of **full-table sum** when `total` is large—address with loading UX and optional warning threshold in **design**.

## Recommended Next Action

Produce **`design.md`**: choose **Next vs Vite**, define **directories**, **API service layer**, **hooks** for list/mutations/totals, **decimal** strategy, **error boundary** / toast pattern, and **README** snippets for env + dev proxy/CORS. Emit **design-summary** and **architecture-to-work-manager** handoff; set state to **waiting for design approval**.
