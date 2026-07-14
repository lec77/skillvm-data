---
name: manufacturing-optimization
description: Solve job-shop and flexible job-shop scheduling problems with machine assignment, precedence constraints, and downtime windows.
---

# Flexible Job-Shop Scheduling (FJSP)

Assign operations to machines and set start times to minimize makespan (max end time).

## Input
- `machines`: count (0..M-1)
- `jobs[]`: each has ordered `operations[]`
- Operation: `{ id, duration: { machine_id: time } }`
- `downtime[]` (optional): `{ machine, start, end }` — unavailable window

## Constraints
1. **Precedence**: op[i+1].start >= op[i].end (within job)
2. **Machine exclusivity**: one op per machine at a time
3. **Downtime**: no op overlaps any downtime window on its machine

## Algorithm

For each operation in precedence order across all jobs:
1. For each eligible machine, find earliest feasible start:
   - `t = max(machine_free_time, job_ready_time)`
   - If op at time t would overlap downtime `[start,end)` on that machine, set `t = window.end`; recheck for additional windows
2. Pick machine giving earliest completion (`t + duration`)
3. Tiebreak: prefer shorter duration
4. Update `machine_free_time[m]` and `job_ready_time[job]`

## Validation (required before output)
- Precedence: each op ends <= next op starts within same job
- Machine: group by machine, sort by start, each ends <= next starts
- Downtime: no assignment overlaps any window on its machine

## Output — `schedule.json`
```json
{
  "assignments": [
    { "op_id": "0-0", "machine": 1, "start": 0, "end": 7 }
  ],
  "makespan": 34
}
```
- `makespan` = max(`end`) across all assignments — compute from schedule
