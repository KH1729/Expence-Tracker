# Handoff: spec → architecture (design)

## Feature

database-and-server-foundation

## From

Spec agent

## To

Architecture / design agent

## Completed Work

- Artifact: `.sdd/workspace/database-and-server-foundation/current/spec.md`
- Summary: `.sdd/summaries/database-and-server-foundation/spec-summary.md`

## Key Decisions

1. Table **`expenses`** with **DECIMAL(10,2)** for `amount`, **VARCHAR** for `description` and `category`, timestamps, single PK.
2. **Health** endpoint required; JSON success/error shapes per project API patterns.
3. **Migrations** as committed SQL (or chosen tool) with README/run instructions.

## Constraints to Preserve

- TypeScript, Express-style stack, zod when bodies exist; async handlers wrapped; no secrets in repo.
- No expense CRUD in this feature.

## Risks / Open Issues

- Resolve **PK strategy** (`CHAR(36)` UUID vs `BIGINT` auto-increment) and **health** semantics when DB is down.

## Recommended Next Action

- Draft **`design.md`**: architecture diagram narrative, **exact DDL**, env var names, **server file layout** (`server/`), middleware order (cors → helmet → rateLimit → bodyParser → routes → errorHandler), pool config, health handler behavior, and **pino** logger wiring.
