# Summary: idea — database-and-server-foundation

## Phase

idea

## What Was Produced

- Idea artifact: `.sdd/workspace/database-and-server-foundation/current/idea.md`
- Defines first vertical slice: **MySQL expenses table**, **migrations/init SQL**, **TypeScript Node server** with env-based DB config and structured logging, **no expense REST API** in this feature.

## Key Decisions

1. **Expense row** includes description, amount, category (string), plus PK and timestamps — details in spec phase.
2. **Out of scope** for this feature: CRUD API, React, auth, category reference table.
3. **Secrets** only via environment variables; document via `.env.example`.

## Risks / Open Issues

- Exact MySQL version and migration tool (raw SQL vs. a migrator) — to lock in **spec/design**.
- Whether to include a DB ping on `/health` — optional in idea; confirm in spec.

## What the Next Agent Must Know

- Project name: **expense-tracker-web**; approved stack: Node.ts server, React.ts client, MySQL; this is **feature 1 of 4** in the approved breakdown.
- Next phase after human approval: **Spec** (`spec.md`), then design/plan/tasks/implementation for **database-and-server-foundation** only.
