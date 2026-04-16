# Handoff: Idea Agent → Spec Agent

## Feature

expense-crud-api

## From

Idea Agent (SDD pipeline)

## To

Spec Agent

## Completed Work

- Artifact: `.sdd/workspace/expense-crud-api/current/idea.md`
- Summary: `.sdd/summaries/expense-crud-api/idea-summary.md`

## Key Decisions

1. Implement **CRUD** for **`expenses`** only; reuse existing DB and server foundation.
2. **Out of scope** for this feature: category entities, attachments, expense UI.
3. **Auth** and **amount validation** (positive-only vs credits) need explicit requirements in spec.

## Constraints to Preserve

- Use **zod** for all request bodies and relevant params.
- Use **asyncHandler** (or equivalent) for async routes; central error JSON shape.
- **No** `console.log` in production route code; **no** secrets in logs.
- Align HTTP status codes with project rules (200/201/204/400/404/422/500 as applicable).

## Risks / Open Issues

- **Security**: confirm whether endpoints are public, internal-only, or behind auth.

## Recommended Next Action

- Draft **spec.md** with numbered **FR/NFR**, **acceptance criteria**, **API contract** (paths, methods, examples), and **edge cases** table; then produce spec summary, handoff to architecture/design, and update state after human approval.
