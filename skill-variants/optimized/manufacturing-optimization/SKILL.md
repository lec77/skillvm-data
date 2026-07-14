---
name: manufacturing-optimization
description: Solve job-shop and flexible job-shop scheduling problems with machine assignment, precedence constraints, and downtime windows. Use when optimizing production schedules or manufacturing workflows.
---

# Flexible Job-Shop Scheduling (FJSP)

Assign operations to machines and set start times to minimize makespan (max end time).

## Input Format
- `machines`: count (indexed 0..M-1)
- `jobs`: array, each with ordered `operations` array
- Each operation: `{ id, duration: { machine_id: time } }`
- `downtime` (optional): `[{ machine, start, end }]` — machine unavailable during window

## Constraints
1. **Precedence**: op[i+1] starts after op[i] ends (within same job)
2. **Machine exclusivity**: one operation per machine at a time
3. **Downtime**: no operation overlaps a downtime window on its machine

## Greedy Algorithm

For each operation in precedence order across all jobs:
1. For each eligible machine, compute earliest feasible start:
   - `t = max(machine_free_time, job_ready_time)`
   - Check downtime: if `t` falls in or operation spans a `[start,end)` window on that machine, set `t = window.end`
   - Recheck after shifting (multiple windows possible)
2. Pick machine with earliest `start + duration`
3. Prefer shorter processing time as tiebreaker
4. Update `machine_free_time` and `job_ready_time`

## Validation
Before reporting, verify ALL constraints:
- Precedence: for each job, each op ends ≤ next op starts
- Machine: group by machine, sort by start, each op ends ≤ next starts
- Downtime: for each assignment on a machine with downtime, ensure no overlap with any window

## Output — `schedule.json`
```json
{
  "assignments": [
    { "op_id": "0-0", "machine": 1, "start": 0, "end": 7 }
  ],
  "makespan": 34
}
```
- `op_id`: matches input operation `id`
- `machine`: integer, `start`/`end`: integers (time units)
- `makespan`: integer = max(`end`) across all assignments — compute from schedule
