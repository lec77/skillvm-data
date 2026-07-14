# Optimization Notebook — `manufacturing-optimization` (bare/qwen3-30b)

## Baseline — 2026-03-31

**AOT score** (`schedule-tight`): 100/100

---

## Round 1 — 2026-03-31 | JIT on `fjsp-schedule`

**JIT task score**: 100/100
**Grader summary**: Baseline scored 100/100. Upgraded the greedy solver to consider all ready operations (not just one job) and try 5 different dispatching heuristics to pick the best makespan, improving robustness for harder task variants.
**Failed criteria**: none

**Planned changes**:
- Solver now considers all ready operations globally at each step instead of only the earliest-ready job
- Added 5 dispatching heuristics (earliest_end, earliest_start, shortest_duration, longest_duration, most_remaining) with best-of selection
- Added explicit Step 3 verification instruction to catch constraint violations before submission
- Added constraint enforcement summary table for clarity

**Skill size**: 2498 → 4976 chars

**Test task result** (`schedule-tight`): 88.7/100 (prev: 100/100, -11.3)

---

## Round 2 — 2026-03-31 | JIT on `job-makespan`

**JIT task score**: 100/100
**Grader summary**: Training task scored 100/100 with baseline solver. Round 1's multi-heuristic changes caused test regression. Reverted to baseline algorithm, added only safe change: use write_file instead of heredoc to avoid shell escaping typos (agent had NameError from mangled heredoc in transcript).
**Failed criteria**: none

**Planned changes**:
- Changed instruction from heredoc/cat to write_file to prevent shell escaping errors seen in transcript
- Added explicit Step 3 verification checklist (lightweight, no algorithm change)
- Preserved exact baseline greedy algorithm that scores 100/100 on both tasks — did NOT re-add multi-heuristic that caused Round 1 regression

**Skill size**: 2498 → 2878 chars

**Test task result** (`schedule-tight`): 100/100 (prev: 88.7/100, +11.3)

---

## Round 3 — 2026-03-31 | JIT on `validate-schedule`

**JIT task score**: 100/100
**Grader summary**: The training task was a validation task (check existing schedule for violations), but the skill only contained a solver. Added a Task Type B section with a validation script template so the agent has guidance for both scheduling and validation tasks.
**Failed criteria**: none

**Planned changes**:
- Added task-type determination table (Schedule vs Validate) at the top
- Added complete validation script template as Task Type B
- Preserved exact baseline solver algorithm that scores 100/100 on schedule-tight test task

**Skill size**: 2878 → 5049 chars

**Test task result** (`schedule-tight`): 74/100 (prev: 100/100, -26.0)
