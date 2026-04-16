# Summary: Tasks — expense-categories-dropdown

## Phase

Tasks

## What Was Produced

- Artifact: `.sdd/workspace/expense-categories-dropdown/current/tasks.md`
- **`implementation/task-board.json`** and **`worker-assignments.json`** initialized.

## Key Decisions

| ID | Title |
|----|--------|
| T-101 | Migration `002` + README |
| T-102 | Categories API + integration tests |
| T-103 | Expenses refactor (JOIN, `categoryId`, mapper) |
| T-104 | Expense integration tests + server README |
| T-105 | Web clients + ExpenseForm |
| T-106 | MSW + web README |

## Risks / Open Issues

- Integration tests need mocked pool updates for new query shapes.

## What Workers Must Know

- Follow **`tasks.md`** Definition of Done per task; **`npm test`** / **`npm run build`** gates as listed.
