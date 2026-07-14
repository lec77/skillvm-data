---
name: manufacturing-optimization
description: Solve job-shop and flexible job-shop scheduling problems with machine assignment, precedence constraints, and downtime windows. Use when optimizing production schedules or manufacturing workflows.
---

# Manufacturing Optimization: Flexible Job-Shop Scheduling

## Overview

The Flexible Job-Shop Scheduling Problem (FJSP) assigns operations to machines and determines start times to minimize total completion time (makespan). Each job has an ordered sequence of operations; each operation can run on one of several eligible machines.

## Problem Formulation

**Inputs:**
- `machines`: total number of machines (indexed 0..M-1)
- `jobs`: array of jobs, each with an ordered `operations` array
- Each operation has an `id`, and a `duration` map: `{ "machine_id": processing_time }`
- `downtime` (optional): array of `{ machine, start, end }` windows when a machine is unavailable

**Constraints:**
1. **Precedence**: within a job, operation `i+1` cannot start until operation `i` finishes
2. **Machine exclusivity**: a machine processes at most one operation at a time
3. **Downtime**: no operation may overlap a scheduled maintenance window on its assigned machine

**Objective:** minimize makespan = max(end time across all operations)

## Greedy Scheduling Heuristic

Process operations in precedence order (topological order across all jobs). For each operation, try all eligible machines and pick the one offering the earliest feasible start.

```
function earliest_start(machine, op, job_ready_time, downtime_windows):
    t = max(machine_free_time[machine], job_ready_time)
    for window in downtime_windows where window.machine == machine:
        if t < window.end and t + duration < window.end:
            if t >= window.start:          # starts inside window → push past it
                t = window.end
        elif t < window.start and t + duration > window.start:
            # would overlap window → push past it
            t = window.end
    return t

for each job in jobs (round-robin or by earliest ready time):
    for each op in job.operations (in order):
        best_machine, best_start = argmin over eligible machines of earliest_start(...)
        assign op to best_machine starting at best_start
        machine_free_time[best_machine] = best_start + duration[best_machine]
        job_ready_time[job] = best_start + duration[best_machine]
```

## Repair Heuristic for Infeasible Schedules

If a schedule violates constraints, shift operations forward:

1. **Precedence violation**: if `op[i+1].start < op[i].end`, set `op[i+1].start = op[i].end`
2. **Machine conflict**: sort operations on a machine by start time; if `op[k+1].start < op[k].end`, shift `op[k+1]` forward (and propagate within the same job)
3. **Downtime violation**: if an operation overlaps a downtime window, move its start to `window.end` and propagate

Repeat until no violations remain (usually converges in 1-2 passes).

## Constraint Checking

A valid schedule must satisfy all three constraint types:

```typescript
function checkPrecedence(assignments, jobs):
    for each job:
        for i in 0..ops.length-2:
            assert assignments[ops[i]].end <= assignments[ops[i+1]].start

function checkMachineConflicts(assignments):
    group assignments by machine
    for each machine group, sort by start:
        for consecutive pairs (a, b):
            assert a.end <= b.start

function checkDowntime(assignments, downtime):
    for each assignment a:
        for each window w where w.machine == a.machine:
            assert a.end <= w.start OR a.start >= w.end
```

## Output Format

Write `schedule.json`:
```json
{
  "assignments": [
    { "op_id": "0-0", "machine": 1, "start": 0, "end": 7 },
    ...
  ],
  "makespan": 34
}
```

- `op_id`: matches the operation `id` from the input
- `machine`: integer, which machine processes this operation
- `start`, `end`: integers, time units
- `makespan`: integer, equals the maximum `end` time across all assignments

## Tips for Good Solutions

- Prefer machines with shorter processing times when tie-breaking on earliest start
- Schedule longer operations first to reduce bottleneck machine contention
- After greedy assignment, verify all constraints before reporting makespan
- The makespan equals `max(assignment.end for all assignments)` — compute it from the schedule, not separately
