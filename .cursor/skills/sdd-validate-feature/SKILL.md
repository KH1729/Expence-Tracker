---
name: sdd-validate-feature
description: >-
  Run validation checks against a feature's artifacts and implementation at any point
  in the SDD pipeline. Use when the user wants to validate a feature, review implementation
  against spec/design, generate a validation report, or check readiness for completion.
---

# Validate Feature

## When to Use

Activate when the request contains phrases like:
- validate feature, review feature, check if feature is complete
- run validation, verify implementation, generate validation report

## Inputs

- **Feature name** — the feature to validate
- **Scope** (optional): `current-phase` (default), `full`, or `implementation`
- **Validators** (optional): override validator count
- **Strict mode** (optional): treat warnings as failures

## Workflow

### Step 1: Scope Resolution
- `current-phase` — validate only the current phase artifact against the previous phase
- `full` — validate all completed artifacts for internal consistency and spec compliance
- `implementation` — validate code and outputs against approved design and task definitions

### Step 2: Adopt Validation Agent Role
Read the Validation Agent definition from the `sdd-build-feature` skill's [agents.md](../sdd-build-feature/agents.md) reference.

### Step 3: Execute Validation
- Read relevant artifacts from `.sdd/workspace/<feature>/current/`
- Read phase summaries from `.sdd/summaries/<feature>/`
- Read applicable engineering and architecture rules
- For each check: compare artifact against its source of truth, record PASS or FAIL
- If FAIL: describe finding with severity (info/warning/error/critical) and evidence

### Step 4: Report
- Write validation report to `.sdd/workspace/<feature>/current/validation.md` using the validation template
- Write summary to `.sdd/summaries/<feature>/validation-summary.md`
- Update `.sdd/state/<feature>.json` with validation status and findings count

### Step 5: Escalation Check
- If any critical finding is detected: stop validation, report immediately, trigger escalation
- In strict mode: any error also triggers a FAIL result

## Outputs

- Validation report with pass/fail per check
- Findings list with severity and evidence
- Overall pass/fail determination
- Next step recommendation

## Important Rules

- Validators review and report ONLY — they do not fix issues
- Every finding needs severity and evidence
- The human developer decides what to do with findings — the system does not auto-reject
- Use diff-based validation where possible to minimize token consumption
- Validate against approved artifacts, not assumptions
