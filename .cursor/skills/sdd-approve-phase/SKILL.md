---
name: sdd-approve-phase
description: >-
  Approve the current SDD phase and advance the workflow to the next phase. Use when
  the user wants to approve a phase, accept the current output, advance the pipeline,
  or sign off on a phase artifact.
---

# Approve Phase

## When to Use

Activate when the request contains phrases like:
- approve this, approve phase, looks good proceed
- accept this, advance to next phase, sign off
- approved with notes, approve with modifications

## Inputs

- **Feature name** — the feature to approve
- **Phase** (optional): explicit phase name; defaults to current pending phase
- **Notes** (optional): attach approval notes visible to downstream agents
- **With modifications** (optional): flag that minor modifications were made before approval

## Workflow

### Step 1: Validate Gate
- Confirm the feature is in a `WAITING_FOR_HUMAN_*_APPROVAL` state
- If not at an approval gate, reject with a clear message explaining the current state

### Step 2: Snapshot to Registry
- Copy the current artifact from `.sdd/workspace/<feature>/current/<phase>.md`
- Version it in the registry: `.sdd/registry/<feature>/<phase>/v<N>.md`
- If a version already exists, increment the version number

### Step 3: Update State
- Update `.sdd/state/<feature>.json`:
  - Add the phase to `approved_phases`
  - Advance `current_phase` to the next phase in the pipeline
  - Set status to the next phase's drafting state
  - Record approval timestamp and any notes
  - Update `registry_versions` with the new version number

### Step 4: Trigger Next Phase
- The next agent in the pipeline begins work on the new phase
- The approved artifact's summary and handoff become the primary inputs

## Outputs

- Versioned artifact snapshot in `.sdd/registry/`
- Updated feature state in `.sdd/state/`
- Workflow advances to the next phase

## Important Rules

- Only valid at an approval gate. Fails with a clear message otherwise.
- Approval is irreversible for that version — but the artifact can be revised in a later rework cycle, producing a new version.
- Developer notes are recorded in the feature state and visible to downstream agents.
- After the final phase (validation), approval transitions the feature to `DONE`.
