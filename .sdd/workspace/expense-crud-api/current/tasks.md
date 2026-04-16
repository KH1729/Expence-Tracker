# Tasks: Expense CRUD API

## Task List

### T-001: HttpError and error handler

- **Scope:** Add `server/src/errors/httpError.ts` exporting **`HttpError`** (extends **`Error`**) with **`statusCode`**, **`code`**, **`message`**. Update **`server/src/middleware/errorHandler.ts`** to detect **`HttpError`** and respond with **`statusCode`** and **`{ success: false, error: { code, message } }`**; else keep existing **500** behavior. Add unit tests (e.g. **`errorHandler.test.ts`**) that invoke the handler with **`HttpError`** and unknown errors (mock **`res`/`next`** or minimal Express harness).
- **Inputs:** `design.md` (HttpError section), existing `errorHandler.ts`.
- **Dependencies:** none
- **Expected Output:** New error module; modified error handler; tests green.
- **Definition of Done:** **`npm test`** passes; **400**/**404**/**503** paths do not return **`INTERNAL_ERROR`** for **`HttpError`**.
- **Validation Notes:** No stack traces in client response for **`HttpError`**; logger still records unexpected errors for **500**.

### T-002: Zod schemas and expense mapper

- **Scope:** Add **`server/src/schemas/expenseSchemas.ts`** (or split files if &gt;250 lines — prefer single file until too large): list query (**`limit`**, **`offset`**), **`id`** param, create body, patch body (at least one field; reject empty patch). Add **`server/src/mappers/expenseMapper.ts`** to map **`RowDataPacket`** / row shape to **`Expense`** with **`amount`** as two-decimal string and **`createdAt`/`updatedAt`** as ISO strings. Unit tests for schema edge cases and mapper.
- **Inputs:** `spec.md` FR-2–FR-7, `design.md`.
- **Dependencies:** T-001
- **Expected Output:** Schemas + mapper + tests.
- **Definition of Done:** Invalid inputs fail zod with messages that can be mapped to **`VALIDATION_ERROR`**; mapper round-trip matches spec field names.
- **Validation Notes:** No **`any`**; strict TypeScript.

### T-003: Expense repository

- **Scope:** Add **`server/src/services/expenseRepository.ts`** (or **`repositories/`** per repo convention — match **`design.md`**) with **`count`**, **`list`**, **`findById`**, **`insert`**, **`updatePartial`**, **`deleteById`** using **`pool`** and **`?`** placeholders only. Return **`null`** or use **`HttpError`** for not-found at repository or route layer (document choice in code). Unit tests with **mocked** **`pool.query`** / **`execute`**.
- **Inputs:** `design.md` SQL sketches, migration DDL.
- **Dependencies:** T-002
- **Expected Output:** Repository module + tests.
- **Definition of Done:** All SQL uses placeholders; no string concatenation of user input.
- **Validation Notes:** Connection errors mapped to operational **503** with safe message at route or repository boundary.

### T-004: Expenses router and app wiring

- **Scope:** Add **`server/src/routes/expenses.ts`** — **`createExpensesRouter({ pool, logger })`** implementing **GET/POST** list and create, **GET/PATCH/DELETE** **`/:id`** with **`asyncHandler`**. Zod-parse query/body/params; call repository; return JSON per spec (**201** on create, **204** on delete). Update **`server/src/app.ts`** and **`CreateAppOptions`** to accept **`Pool`** and **`app.use('/api/expenses', router)`** after health. Update **`server/src/index.ts`** to pass **`pool`** into **`createApp`**. Update **existing** tests that call **`createApp`** to supply a **mock pool** or real pool double.
- **Inputs:** `spec.md`, `design.md`, T-001–T-003 outputs.
- **Dependencies:** T-003
- **Expected Output:** Working CRUD routes; app compiles.
- **Definition of Done:** Manual or automated smoke: list/create/get/patch/delete returns expected status codes.
- **Validation Notes:** Middleware order preserved.

### T-005: Integration tests and README

- **Scope:** Add **`server/src/routes/expenses.integration.test.ts`** (or **`__tests__/`** colocated) using **Supertest** + **`createApp`** + mocked **`pool`** to cover: list with **total**, get **404**, create **201**, patch **404**, delete **204**, validation **400** (at least one case per group as spec). Extend **`server/README.md`**: **MVP no-auth** warning, method/path table, example JSON. **Optional:** add `METHOD /path` lines per project documentation rule if README is the API doc home.
- **Inputs:** `spec.md` acceptance criteria, prior tasks.
- **Dependencies:** T-004
- **Expected Output:** Integration tests + README.
- **Definition of Done:** **`npm test`** passes; README allows a developer to call the API.
- **Validation Notes:** Arrange / Act / Assert; no real MySQL required for CI.

## Human Approval Status

- [x] Task list reviewed and approved with plan (2026-04-16)
- [x] Ready for worker execution **T-001** → **T-005**
