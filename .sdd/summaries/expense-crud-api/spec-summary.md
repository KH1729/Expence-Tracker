# Summary: spec — expense-crud-api

## Phase

spec

## What Was Produced

- Artifact: `.sdd/workspace/expense-crud-api/current/spec.md`
- REST API under **`/api/expenses`**: **`GET`** (list + `limit`/`offset`, `total`, newest first), **`GET :id`**, **`POST`**, **`PATCH`** (partial), **`DELETE`** (**`204`** on success).
- **Expense** JSON: **camelCase**; **`amount`** as **two-decimal string**; timestamps ISO UTC; maps from snake_case DB columns.
- **Validation:** zod; **strictly positive** `amount`; **no auth** in this feature (network/CORS/rate-limit only).
- **Errors:** **`VALIDATION_ERROR`** (400), **`NOT_FOUND`** (404), parameterized SQL only.

## Key Decisions

1. **Base path** `/api/expenses` and **numeric** path ids (`BIGINT UNSIGNED` range).
2. **PATCH** for partial update; **reject empty PATCH** body with **400**.
3. **List** includes **`total`** row count for pagination UX.
4. **camelCase** API fields vs **snake_case** DB — explicit mapping required in implementation.

## Risks / Open Issues

- **No authentication** — production deployments need network controls or a future auth feature.
- **COUNT(*)** each list call — acceptable MVP; may need optimization at scale.

## What the Next Agent Must Know

- Proceed to **design.md**: router module layout, repository layer vs routes, **HTTP status** mapping for validation (400 vs 422 — pick one), **AppError** / not-found pattern so **`404`** is not turned into **`500`**, integration test strategy (Supertest + test DB or pool mock), and **README** API section per project rules.
