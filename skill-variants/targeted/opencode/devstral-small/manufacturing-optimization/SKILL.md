---
name: manufacturing-optimization
description: Solve job-shop and flexible job-shop scheduling problems with machine assignment, precedence constraints, and downtime windows. Use when optimizing production schedules or manufacturing workflows.
---

# FJSP Scheduling — Write and Run a Script

CRITICAL: Do NOT solve scheduling problems by hand. ALWAYS write a Python script, run it with `python3 solve.py`, then verify `schedule.json` was created.

## Steps

1. Read `jobs.json`
2. Write `solve.py` using the algorithm below
3. Run `python3 solve.py`
4. Verify `schedule.json` exists

## Complete Solver Algorithm (copy and adapt)

```python
import json

with open("jobs.json") as f:
    data = json.load(f)

jobs = data["jobs"]
downtime = data.get("downtime", [])
num_machines = data["machines"]

machine_free = [0] * num_machines
job_ready = [0] * len(jobs)
next_op_idx = [0] * len(jobs)
result = []
total_ops = sum(len(j["operations"]) for j in jobs)

for _ in range(total_ops):
    best = None
    for j, job in enumerate(jobs):
        if next_op_idx[j] >= len(job["operations"]):
            continue
        op = job["operations"][next_op_idx[j]]
        for m_str, dur in op["duration"].items():
            m = int(m_str)
            t = max(machine_free[m], job_ready[j])
            for w in downtime:
                if w["machine"] == m and t < w["end"] and t + dur > w["start"]:
                    t = w["end"]
            end = t + dur
            if best is None or end < best[4]:
                best = (j, op["id"], m, t, end, dur)
    j, op_id, m, start, end, dur = best
    result.append({"op_id": op_id, "machine": m, "start": start, "end": end})
    machine_free[m] = end
    job_ready[j] = end
    next_op_idx[j] += 1

makespan = max(a["end"] for a in result)
with open("schedule.json", "w") as f:
    json.dump({"assignments": result, "makespan": makespan}, f, indent=2)
```

## Output Format

`schedule.json` must contain:
```json
{
  "assignments": [
    {"op_id": "0-0", "machine": 1, "start": 0, "end": 7}
  ],
  "makespan": 34
}
```

- `op_id`: string matching the operation id from input
- `machine`: integer
- `start`, `end`: integers, `end = start + duration_on_assigned_machine`
- `makespan`: equals the maximum `end` across all assignments
