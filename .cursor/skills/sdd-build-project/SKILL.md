---
name: sdd-build-project
description: >-
  Initialize and orchestrate the SDD pipeline for an entire project by decomposing it
  into features and running sdd-build-feature for each. Use when the user wants to build
  a project, start a project, initialize a project, or bootstrap a new codebase with the
  SDD toolkit.
---

# Build Project

## When to Use

Activate when the request contains phrases like:
- build project, start project, initialize project, bootstrap project
- create new project with toolkit, set up project using SDD

## Inputs

- **Project name** — short identifier (e.g., `user-management-platform`)
- **Project description** — high-level description of the project
- **Options** (optional): mode override, total token budget, parallel flag

## Workflow

### Step 1: Project Capture
- Capture the project description
- Decompose into discrete features with a proposed ordering
- Present the feature list for human approval
- The developer may add, remove, reorder, or merge features

### Step 2: Sequential Feature Execution
- Each approved feature runs through the full `sdd-build-feature` pipeline
- In manual mode, each feature completes fully (including all approval gates) before the next begins
- In guided/delegated mode, parallel feature pipelines may be allowed if explicitly enabled

### Step 3: Cross-Feature Coordination
- Maintain a project-level view tracking shared dependencies, architecture decisions, and interface contracts
- Identify cross-feature dependencies during the plan phase of each feature
- Ensure consistency across feature boundaries

### Step 4: Project Validation
- After all features complete, run a final project-level validation pass
- Check cross-feature integration, consistency, and completeness
- Write project summary to `.sdd/summaries/<project>/project-summary.md`

## Outputs

- All individual feature outputs (state, summaries, workspace, registry)
- Project-level summary
- Project feature list and dependency map

## Important Rules

- Feature decomposition must be approved by the human before execution begins
- Features run independently through the pipeline, each with their own approval gates
- Cross-feature dependencies must be identified and tracked
- In manual mode, parallel feature execution is not permitted
- This skill delegates per-feature work to `sdd-build-feature`
