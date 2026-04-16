# Handoff: Spec Agent → Architecture Agent

## Feature

expense-crud-api

## From

Spec Agent

## To

Architecture Agent (Design)

## Completed Work

- Artifact: `.sdd/workspace/expense-crud-api/current/spec.md`
- Summary: `.sdd/summaries/expense-crud-api/spec-summary.md`

## Key Decisions

1. Routes mounted at **`/api/expenses`** before **notFound** / **errorHandler**.
2. **PATCH** partial updates; **POST** create; **DELETE** → **204** without body.
3. Public **JSON** uses **camelCase**; persistence remains **snake_case** MySQL columns.
4. **Amount** in API as **string** with two decimals; validate with zod before SQL.
5. **No auth** in v1; document deployment caveat.

## Constraints to Preserve

- Middleware order: **cors → helmet → rateLimit → express.json() → routes → notFound → errorHandler**.
- **asyncHandler** on async routes; **zod** on bodies and query; **mysql2** parameterized queries only.
- Error JSON: **`{ success: false, error: { code, message } }`**; success **`{ success: true, data: … }`**.
- Do not log secrets; use **pino**.

## Risks / Open Issues

- Express default error handler maps unknown throws to **500** — design must specify **NotFoundError** / **`http-errors`** or custom **`AppError`** with **`statusCode`** so **`404`** and **400** propagate correctly.
- Decide **400** vs **422** for zod failures and stick to one project-wide.

## Recommended Next Action

- Produce **design.md** with module/file layout (`routes/expenses.ts`, `services` or `repositories/expensesRepository.ts`, zod schemas), exact response examples, **integration test** approach, and any **index** recommendations for `created_at` if queries need it.
