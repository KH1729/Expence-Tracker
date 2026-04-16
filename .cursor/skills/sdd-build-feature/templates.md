# SDD Artifact Templates

## Idea Template

```markdown
# Idea: {{title}}

## Raw Request

{{Paste or describe the original request exactly as received.}}

## Normalized Summary

{{A clear, 2-3 sentence summary of what is being requested, written in neutral technical language.}}

## Initial Scope

{{What this feature will do. Bullet list of capabilities.}}

-

## Out of Scope

{{What this feature will NOT do. Be explicit to prevent scope creep.}}

-

## Assumptions

{{What are we assuming to be true? These will be validated during the spec phase.}}

-

## Constraints

{{Known technical, business, or timeline constraints.}}

-

## Human Approval Status

- [ ] Idea reviewed by human developer
- [ ] Scope confirmed
- [ ] Ready to proceed to Spec phase
```

---

## Spec Template

```markdown
# Spec: {{title}}

## Background / Context

{{Why does this feature exist? What problem does it address?}}

## Problem Statement

{{A clear, concise statement of the problem being solved.}}

## Goals

1.

## Non-Goals

1.

## User Stories / Use Cases

### US-1: {{title}}
**As a** {{role}}, **I want to** {{action}}, **so that** {{outcome}}.

## Functional Requirements

### FR-1: {{title}}
{{Description}}

## Non-Functional Requirements

### NFR-1: {{title}}
{{Description}}

## Constraints

-

## Assumptions

-

## Edge Cases

| Edge Case | Expected Behavior |
|---|---|
| | |

## Acceptance Criteria

- [ ]

## Open Questions

1.
```

---

## Design Template

```markdown
# Design: {{title}}

## Design Summary

{{High-level summary of the technical approach in 3-5 sentences.}}

## Architecture Impact

- Impact level: none | low | medium | high
- New components:
- Modified components:

## Components / Modules Affected

| Component | Change Type | Description |
|---|---|---|
| | new / modified | |

## Interfaces / APIs

### {{Interface Name}}
- **Endpoint / Method:**
- **Input:**
- **Output:**
- **Errors:**

## Data Flow

1.

## Data Model / Schema Changes

| Entity | Change | Fields |
|---|---|---|
| | new / modified | |

## Security Considerations

-

## Observability Considerations

-

## Testing Strategy

- Unit tests:
- Integration tests:
- Edge case tests:

## Rollout / Migration Notes

-

## Risks / Tradeoffs

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| | | | |
```

---

## Plan Template

```markdown
# Plan: {{title}}

## Execution Strategy

- Approach: sequential | parallel | mixed
- Estimated workers:
- Estimated validators:

## Work Phases

### Phase 1: {{title}}
- **Goal:**
- **Tasks:**
- **Dependencies:** none | {{list}}
- **Validation checkpoint:** yes | no

### Phase 2: {{title}}
- **Goal:**
- **Tasks:**
- **Dependencies:** Phase 1
- **Validation checkpoint:** yes | no

## Dependency Map

| Task/Phase | Depends On | Blocking? |
|---|---|---|
| | | |

## Integration Approach

-

## Rollout Order

1.

## Risks / Coordination Notes

-
```

---

## Tasks Template

```markdown
# Tasks: {{title}}

## Task List

### T-001: {{title}}
- **Scope:** {{What exactly this task covers}}
- **Inputs:** {{What the worker needs to read or receive}}
- **Dependencies:** none | {{task IDs}}
- **Expected Output:** {{What the worker must produce}}
- **Definition of Done:** {{Conditions for marking this task complete}}
- **Validation Notes:** {{What validators should check for this task}}

### T-002: {{title}}
- **Scope:**
- **Inputs:**
- **Dependencies:** T-001
- **Expected Output:**
- **Definition of Done:**
- **Validation Notes:**
```

---

## Validation Template

```markdown
# Validation: {{title}}

## Validation Scope

- **Feature:** {{feature_name}}
- **Phase validated:** {{phase or "full"}}
- **Validated against:** {{source of truth — spec, design, rules, etc.}}
- **Validator:** {{validator_id}}

## Checks Performed

### Check 1: {{title}}
- **What was checked:**
- **Expected:**
- **Found:**
- **Result:** PASS | FAIL
- **Severity:** info | warning | error | critical
- **Evidence:**

## Findings Summary

| # | Finding | Severity | Result |
|---|---|---|---|
| 1 | | | |

## Overall Result

- **Pass/Fail:**
- **Critical findings:** {{count}}
- **Errors:** {{count}}
- **Warnings:** {{count}}

## Required Rework

1.

## Confidence Notes

-
```

---

## Summary Template

```markdown
# Summary: {{phase}} — {{feature}}

## Phase

{{idea | spec | design | plan | tasks | implementation | validation}}

## What Was Produced

-

## Key Decisions

1.

## Risks / Open Issues

-

## What the Next Agent Must Know

-
```

---

## Handoff Template

```markdown
# Handoff: {{from_agent}} → {{to_agent}}

## Feature

{{feature_name}}

## From

{{Agent that completed the work}}

## To

{{Agent that will receive this handoff}}

## Completed Work

- Artifact: `.sdd/workspace/{{feature}}/current/{{artifact}}.md`
- Summary: `.sdd/summaries/{{feature}}/{{phase}}-summary.md`

## Key Decisions

1.

## Constraints to Preserve

-

## Risks / Open Issues

-

## Recommended Next Action

-
```
