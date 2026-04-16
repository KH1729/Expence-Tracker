# Implementation output: expense-crud-api

## Summary

- `HttpError` + `createErrorHandler` branch for 400/404/503-style operational errors.
- `expenseSchemas.ts` (zod), `expenseMapper.ts`, `expenseRepository.ts`, `routes/expenses.ts`.
- `createApp` now requires `pool`; `index.ts` passes `initializePool` result.
- Tests: unit (schemas, mapper, repository, errorHandler) + `expenses.integration.test.ts` (mocked pool).
- `server/README.md` documents expense endpoints and MVP no-auth warning.

## Verification

- `cd server && npm run build` — pass
- `cd server && npm test` — pass (29 tests)
