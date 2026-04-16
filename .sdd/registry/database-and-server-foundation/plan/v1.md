# Plan: Database and server foundation

## Execution Strategy

- **Approach:** sequential (single worker; tight coupling on `server/` bootstrap).
- **Estimated workers:** 1
- **Estimated validators:** 1

## Work Phases

### Phase 1: Repository and schema

- **Goal:** Runnable `server/` package skeleton and committed migration SQL with docs.
- **Tasks:** T-001, T-002
- **Dependencies:** none
- **Validation checkpoint:** yes (migration SQL reviewed; `package.json` scripts exist)

### Phase 2: Configuration and database access

- **Goal:** Typed env validation, `.env.example`, pool + ping used by health later.
- **Tasks:** T-003, T-004
- **Dependencies:** Phase 1 (T-001 for `server/` layout)
- **Validation checkpoint:** yes (missing env exits non-zero in test or manual check)

### Phase 3: HTTP server and health

- **Goal:** Express app with required middleware order, `GET /health` 200/503 contract, error handler.
- **Tasks:** T-005, T-006
- **Dependencies:** Phase 2
- **Validation checkpoint:** yes (Supertest or equivalent)

### Phase 4: Tests and docs polish

- **Goal:** Unit + integration coverage for critical paths; root README pointer if needed.
- **Tasks:** T-007
- **Dependencies:** Phase 3
- **Validation checkpoint:** yes (tests green)

## Dependency Map

| Task/Phase | Depends On | Blocking? |
|------------|------------|-----------|
| T-002 | T-001 | yes (paths under `server/`) |
| T-003 | T-001 | yes |
| T-004 | T-003 | yes |
| T-005 | T-004 | yes |
| T-006 | T-005 | yes |
| T-007 | T-006 | yes |

## Integration Approach

- Single PR or single implementation batch under `server/` plus root `.gitignore` / `.env.example` at repo root or `server/` per task notes.
- Manual migration run against MySQL before manual smoke of `/health`.

## Rollout Order

1. Apply `001_create_expenses.sql` to dev database.
2. Copy `.env.example` → `.env`, fill secrets.
3. `npm install` / `npm run dev` in `server/`, curl `/health`.

## Risks / Coordination Notes

- Local MySQL required for full integration test; use mocked pool for unit/integration where MySQL absent in CI unless testcontainers added later.
