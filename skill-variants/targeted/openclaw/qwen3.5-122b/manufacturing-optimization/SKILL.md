---
name: manufacturing-optimization
description: Solve job-shop and flexible job-shop scheduling problems with machine assignment, precedence constraints, and downtime windows. Use when optimizing production schedules or manufacturing workflows.
---

# Manufacturing Optimization: Flexible Job-Shop Scheduling

## CRITICAL: Always Write a Python Script

**Never solve FJSP problems manually.** Always:
1. Read the input JSON file
2. Write a Python solver script
3. Execute the script to produce schedule.json
4. Verify the output file exists and is valid

## Problem

The Flexible Job-Shop Scheduling Problem (FJSP) assigns operations to machines and determines start times to minimize makespan (max end time). Inputs:
- `machines`: number of machines (0..M-1)
- `jobs`: array of jobs with ordered `operations`, each having `id` and `duration` map `{"machine_id": time}`
- `downtime` (optional): array of `{machine, start, end}` maintenance windows

**Constraints:**
1. **Precedence**: operation i+1 starts after operation i ends (within same job)
2. **Machine exclusivity**: one operation per machine at a time
3. **Downtime**: operations must not overlap any downtime window on their assigned machine

## Python Solver Template

Write this script, then run it with `python3 solve.py`:

```python
import json

def earliest_start(machine, duration, job_ready, machine_free, downtime):
    t = max(machine_free.get(machine, 0), job_ready)
    # Keep checking downtime until no overlap
    changed = True
    while changed:
        changed = False
        for w in downtime:
            if w["machine"] == machine:
                if t < w["end"] and t + duration > w["start"]:
                    t = w["end"]
                    changed = True
    return t

with open("jobs.json") as f:
    data = json.load(f)

downtime = data.get("downtime", [])
machine_free = {}
job_ready = {}
assignments = []

for job in data["jobs"]:
    job_ready[job["id"]] = 0

# Process all operations in round-robin order by job
remaining = {j["id"]: list(j["operations"]) for j in data["jobs"]}
while any(remaining.values()):
    for job in data["jobs"]:
        if not remaining[job["id"]]:
            continue
        op = remaining[job["id"]].pop(0)
        best_m, best_s, best_d = None, float("inf"), float("inf")
        for ms, dur in op["duration"].items():
            m = int(ms)
            s = earliest_start(m, dur, job_ready[job["id"]], machine_free, downtime)
            if s < best_s or (s == best_s and dur < best_d):
                best_m, best_s, best_d = m, s, dur
        end = best_s + best_d
        assignments.append({"op_id": op["id"], "machine": best_m, "start": best_s, "end": end})
        machine_free[best_m] = end
        job_ready[job["id"]] = end

makespan = max(a["end"] for a in assignments)
with open("schedule.json", "w") as f:
    json.dump({"assignments": assignments, "makespan": makespan}, f, indent=2)
print(f"Makespan: {makespan}")
```

## Output Format

Write `schedule.json`:
```json
{
  "assignments": [
    {"op_id": "0-0", "machine": 1, "start": 0, "end": 7}
  ],
  "makespan": 34
}
```

- `op_id`: matches operation `id` from input
- `machine`: integer
- `start`, `end`: integers (time units)
- `makespan`: equals max `end` across all assignments
