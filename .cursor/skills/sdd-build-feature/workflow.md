# SDD Workflow Reference

## State Machine

```
IDEA_CAPTURED
    ↓
WAITING_FOR_HUMAN_IDEA_APPROVAL
    ↓ (approve)          ↘ (rework → IDEA_CAPTURED)
SPEC_DRAFTED
    ↓
WAITING_FOR_HUMAN_SPEC_APPROVAL
    ↓ (approve)          ↘ (rework → SPEC_DRAFTED)
SPEC_APPROVED → DESIGN_DRAFTED
    ↓
WAITING_FOR_HUMAN_DESIGN_APPROVAL
    ↓ (approve)          ↘ (rework → DESIGN_DRAFTED)
DESIGN_APPROVED → PLAN_DRAFTED
    ↓
WAITING_FOR_HUMAN_PLAN_APPROVAL
    ↓ (approve)          ↘ (rework → PLAN_DRAFTED)
PLAN_APPROVED → TASKS_DRAFTED
    ↓
WAITING_FOR_HUMAN_TASKS_APPROVAL
    ↓ (approve)          ↘ (rework → TASKS_DRAFTED)
TASKS_APPROVED → IMPLEMENTATION_IN_PROGRESS
    ↓
WAITING_FOR_HUMAN_IMPLEMENTATION_APPROVAL
    ↓ (approve)          ↘ (rework → IMPLEMENTATION_IN_PROGRESS)
IMPLEMENTATION_COMPLETE → VALIDATION_IN_PROGRESS
    ↓
VALIDATION_REVIEW_REQUIRED
    ↓
WAITING_FOR_HUMAN_FINAL_DECISION
    ↓ (approve)          ↘ (rework → any prior state)
DONE
```

Any state can transition to `ESCALATED`. After human resolution, execution returns to the prior state.

### Invariants

- Only one state is active per feature at a time.
- `WAITING_FOR_HUMAN_*` states can only be exited by a human action (approve or rework).
- No agent may transition out of a waiting state programmatically in manual mode.

---

## Phase Requirements

Each phase must emit four valid outputs before advancing:

| Output | Location |
|---|---|
| Artifact | `.sdd/workspace/<feature>/current/<phase>.md` |
| Summary | `.sdd/summaries/<feature>/<phase>-summary.md` |
| Handoff | `.sdd/handoffs/<feature>/<from>-to-<to>.md` |
| State Update | `.sdd/state/<feature>.json` |

A phase is complete only if all four outputs are present, internally consistent, and the summary accurately reflects the artifact.

---

## Approval Modes

| Mode | Behavior |
|---|---|
| **Manual** | Every gate requires explicit human approval |
| **Guided** | Low-risk gates auto-advance; high-impact gates require human approval |
| **Delegated** | All gates auto-advance (developer accepts full responsibility) |

Default is `manual`. Only the developer can switch modes.

---

## Escalation Policy

### Mandatory Escalation Triggers

1. **Ambiguity** — requirement/instruction has multiple valid interpretations. Stop, present options, do not guess.
2. **Risky Tradeoffs** — meaningful tradeoff where the right answer depends on business context. Present pros/cons.
3. **Architecture Deviations** — current phase requires changes to approved architecture, interfaces, or scope. Stop for approval.
4. **High-Severity Findings** — critical/high validation finding indicating a fundamental problem. Stop validation, report immediately.
5. **Token/Cost Concerns** — phase consuming significantly more tokens than expected. Attempt optimization, then escalate.
6. **Conflicting Requirements** — two approved requirements contradict. Present both sources.
7. **Excessive Rework** — same phase rejected and reworked more than twice. Escalate for deeper investigation.
8. **Unclear Success Criteria** — cannot determine what constitutes success for the current phase.
9. **Scope Creep** — new requirements introduced beyond the approved spec. Stop, request approval.
10. **Missing Inputs** — required specs, configs, or dependencies are missing or inaccessible.

### Escalation Format

1. **What** — clear description of the issue
2. **Why** — why this requires human input
3. **Options** — available options with tradeoffs (if applicable)
4. **Recommendation** — agent's recommendation (human decides)
5. **Impact of delay** — what happens if not resolved promptly
6. **References** — relevant specs, decisions, or artifact paths

---

## Resource Allocation

### Scaling Guidelines

| Feature Size | Budget | Workers | Validators | Strategy |
|---|---|---|---|---|
| Small (1-2 tasks) | Any | 1 | 1 | Sequential |
| Medium (3-6 tasks) | Normal | 2-3 | 1 | Parallel where safe |
| Medium (3-6 tasks) | Low | 1 | 1 | Sequential + compressed |
| Large (7+ tasks) | Normal | 3-5 | 2-3 | Parallel + checkpoints |
| Large (7+ tasks) | Low | 2 | 1 | Sequential + compressed |

### Task Independence Requirement

Parallel execution only when tasks are sufficiently independent. Tasks are NOT independent if they modify the same files, depend on shared intermediate outputs, or require the same large body of context.

### Low-Budget Priority Order

1. Sequential execution only (no parallel workers)
2. Minimal workers (1 unless clearly justified)
3. Minimal validators (1 regardless of feature size)
4. Compressed summaries (essential facts only)
5. Scoped validation (critical paths only)
6. Single-pass preference (get each phase right the first time)

### Validator Split Options

When using multiple validators, split by:
- Concern (functional correctness, performance, security)
- Task group or artifact boundary

Avoid duplicate validation of the same artifact.

### Hard Limits

- Workers: min 1, max 5, default 1
- Validators: min 1, max 3, default 1
- Dynamic scaling based on: complexity, token budget, model capability, coordination cost
