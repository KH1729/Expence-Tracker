---
name: sdd-request-rework
description: >-
  Reject the current SDD phase output and send it back for revision with specific
  feedback. Use when the user wants to reject output, request changes, send a phase
  back for rework, or provide review comments that must be incorporated.
---

# Request Rework

## When to Use

Activate when the request contains phrases like:
- rework this, needs changes, send back, revise this
- not approved, fix these issues, reject this phase

## Inputs

- **Feature name** — the feature requiring rework
- **Feedback** — what needs to change (must be specific and actionable)
- **Phase** (optional): target a specific phase (defaults to current)
- **Severity** (optional): low, medium, or high
- **Rollback-to** (optional): roll back to an earlier phase if the issue is fundamental

## Workflow

### Step 1: Validate State
- Confirm the feature is at an approval gate or in a reviewable state
- If not at a gate, reject the command with a clear message

### Step 2: Record Feedback
- Store the rework request in `.sdd/state/<feature>.json`:
  - feedback text
  - severity
  - target phase
  - timestamp
- Preserve rework history (append, don't overwrite previous rework entries)

### Step 3: State Rollback
- Move feature state back to the target phase's drafting state (e.g., `SPEC_DRAFTED` if spec needs rework)
- If `rollback-to` is specified, roll back further to the named phase
- If rolling back past an approved phase: all downstream artifacts are invalidated and must be re-drafted

### Step 4: Re-engage Agent
- The responsible agent is re-invoked with the rework feedback and existing artifact as context
- The agent addresses only the rejected concerns (not a full redo unless required)

## Outputs

- Updated feature state reflecting the rework request
- Rework feedback recorded in state
- Responsible agent re-engaged with feedback

## Important Rules

- Rework feedback must be specific and actionable. Vague rejections waste tokens.
- Rework cycles are tracked. More than 2 rework cycles on a single phase triggers an escalation recommendation.
- After rework, the phase goes through the same approval gate again.
