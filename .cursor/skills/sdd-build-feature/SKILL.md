---
name: sdd-build-feature
description: >-
  Orchestrates the Spec-Driven Development pipeline for one feature: Idea → Spec → Design →
  Plan/Tasks → Implementation → Validation, with human approval gates and four outputs per
  phase (artifact, summary, handoff, state). Use when building or continuing a feature through
  SDD, drafting specs/designs/plans/tasks, running SDD agents, or when the user mentions
  sdd-build-feature, approval gates, or .sdd/workspace.
---

# Build Feature (SDD)

## When to use

- Phrases: build feature, start feature, continue feature, SDD pipeline, spec/design/plan/tasks for a feature
- Paths: `.sdd/workspace`, `.sdd/state`, approval or rework of a phase

## Inputs

| Input | Required | Notes |
|-------|----------|--------|
| Feature name | Yes | Kebab-case id (e.g. `bulk-user-import`) |
| Raw idea | Yes for new work | Free-text; normalize with [templates.md](templates.md) |
| Mode / budget / workers | No | Default: `manual`, minimal workers (see [workflow.md](workflow.md)) |

**Resuming:** Read `.sdd/state/<feature>.json` first. Continue from `current_phase` + `status`; do not restart earlier phases unless the human requests rework.

## Invariants (manual mode)

- Do not advance a phase without explicit human approval.
- Do not silently change scope, architecture, or approved artifacts.
- Every phase emits **four** outputs before stopping — see [workflow.md](workflow.md) “Phase Requirements”.

## Phase workflow

Run steps in order. After each step, **stop** and present the draft for human review unless mode is delegated and the human has opted in.

### Step 1 — Idea

- Artifact: `.sdd/workspace/<feature>/current/idea.md` (idea template)
- Summary: `.sdd/summaries/<feature>/idea-summary.md`
- Handoff: `.sdd/handoffs/<feature>/idea-to-spec.md`
- State: `.sdd/state/<feature>.json` — set `current_phase` to `idea`, `status` to `waiting_for_approval`, set `created_at` / `updated_at` if new

### Step 2 — Spec (after idea approval)

- Adopt **Spec Agent** ([agents.md](agents.md)).
- Artifact: `spec.md` · Summary · Handoff `spec-to-architecture.md` · Update state (`current_phase`: `spec`)

### Step 3 — Design (after spec approval)

- Adopt **Architecture Agent**.
- Artifact: `design.md` · Summary · Handoff `architecture-to-work-manager.md` · Update state (`current_phase`: `design`)

### Step 4 — Plan + tasks (after design approval)

- Adopt **Work Manager Agent**.
- Artifacts: `plan.md`, `tasks.md` · Summaries for plan and tasks · Handoff `manager-to-workers.md`
- Init: `.sdd/workspace/<feature>/implementation/task-board.json`, `worker-assignments.json`
- Update state (`current_phase`: `tasks`; `status`: `waiting_for_approval`)

### Step 5 — Implementation (after tasks approval)

- Adopt **Worker Agent** per assignment.
- Outputs under `.sdd/workspace/<feature>/implementation/outputs/` · Tests · Update task board · Handoff `workers-to-validators.md`
- Update state (`current_phase`: `implementation`, `status`: `waiting_for_approval` when ready for validation)

### Step 6 — Validation (after implementation approval)

- Adopt **Validation Agent** (report only; no fixes).
- Artifact: `validation.md` · Summary · Update state (`current_phase`: `validation`)

### Step 7 — Done (after final approval)

- Snapshot approved artifacts to `.sdd/registry/<feature>/<phase>/vN.md` (immutable versions per project rules)
- State: `status`: `done`, append phases to `approved_phases`, bump `registry_versions`, refresh `updated_at`

## Escalation

Use the format in [workflow.md](workflow.md) when ambiguity, tradeoffs, scope drift, contradictory requirements, excessive rework (>2 cycles on one phase), or critical validation findings appear.

## Resource scaling

Default: **1 worker**, **1 validator**. Scale only when tasks are independent and coordination cost is justified:

| Size | Tasks | Typical workers | Validators | Notes |
|------|-------|-----------------|------------|--------|
| Small | 1–2 | 1 | 1 | Sequential |
| Medium | 3–6 | 2–3 | 1 | Parallel where safe |
| Large | 7+ | 3–5 | 2–3 | Parallel + checkpoints |
| Low token budget | any | 1 | 1 | Sequential, compressed summaries |

Hard limits and validator split options: [workflow.md](workflow.md).

## Reference files

| File | Purpose |
|------|---------|
| [agents.md](agents.md) | Agent roles, inputs/outputs, stop conditions |
| [templates.md](templates.md) | Idea, spec, design, plan, task, handoff shapes |
| [workflow.md](workflow.md) | State machine, four outputs, modes, escalation |
