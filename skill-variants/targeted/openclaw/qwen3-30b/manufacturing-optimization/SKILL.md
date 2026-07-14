---
name: manufacturing-optimization
description: Solve flexible job-shop scheduling problems. Use when optimizing production schedules.
---

# Flexible Job-Shop Scheduling (FJSP)

## What To Do

1. Read `jobs.json` to get machines, jobs, operations, and optional downtime windows
2. Write a Python script called `solve.py` that implements a greedy scheduler
3. Run `python3 solve.py` to produce `schedule.json`

## Algorithm

For each operation (processing jobs round-robin, operations in order within each job):
1. For each eligible machine, compute earliest feasible start time
2. Earliest start = max(machine_available_time, job_previous_op_end_time)
3. If downtime windows exist on that machine, push start past any overlapping window
4. Pick the machine giving earliest completion (start + duration)
5. Record the assignment and update machine/job availability

## Python Script Template

Write this script as `solve.py`. Adapt it to the specific input data.

The script must:
- Open and parse `jobs.json`
- Get the list of jobs, number of machines, and downtime array (may be empty or absent)
- For each job, iterate operations in order
- For each operation, try all eligible machines (keys of the duration dict)
- Pick the machine with earliest end time, respecting downtime
- Save result to `schedule.json`

Key variables to track:
- `machine_free`: list of length num_machines, initialized to 0
- `job_ready`: list of length num_jobs, initialized to 0

For each operation with id `op_id` and duration map `dur_map`:
```
best_end = infinity
for each (machine_str, duration) in dur_map:
    machine = int(machine_str)
    start = max(machine_free[machine], job_ready[job_index])
    # push past downtime if needed
    for each downtime window w on this machine:
        if start < w.end and start + duration > w.start:
            start = w.end
    end = start + duration
    if end < best_end:
        best_end = end
        best_machine = machine
        best_start = start
        best_duration = duration
assign: op_id, best_machine, best_start, best_end
machine_free[best_machine] = best_end
job_ready[job_index] = best_end
```

After all operations are scheduled:
- `makespan = max(a.end for all assignments)`
- Write `{"assignments": [...], "makespan": N}` to `schedule.json`

## Output Format

`schedule.json` must have this exact structure:
```json
{
  "assignments": [
    {"op_id": "0-0", "machine": 1, "start": 0, "end": 7}
  ],
  "makespan": 34
}
```

Fields:
- `op_id`: string matching operation id from input (like "0-0", "1-2")
- `machine`: integer
- `start`, `end`: integers (time units)
- `makespan`: integer, the maximum `end` value across all assignments

## Constraints

1. **Precedence**: within a job, operation i must finish before operation i+1 starts
2. **No overlap**: a machine handles one operation at a time
3. **Downtime**: operations must not overlap any downtime window on their assigned machine
