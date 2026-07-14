---
name: manufacturing-optimization
description: Solve flexible job-shop scheduling problems. Write a Python script using the greedy algorithm below, run it, output schedule.json.
---

# Flexible Job-Shop Scheduling

Read jobs.json, write a Python greedy scheduler, run it to produce schedule.json.

## Input Format (jobs.json)

```json
{
  "machines": 4,
  "downtime": [{"machine": 0, "start": 10, "end": 15}],
  "jobs": [
    {"id": 0, "operations": [
      {"id": "0-0", "duration": {"0": 3, "1": 4}},
      {"id": "0-1", "duration": {"2": 5}}
    ]}
  ]
}
```

- `duration` keys are machine IDs (strings), values are processing times
- `downtime` may be absent (no downtime constraints)

## Output Format (schedule.json)

```json
{
  "assignments": [
    {"op_id": "0-0", "machine": 0, "start": 0, "end": 3}
  ],
  "makespan": 15
}
```

## Algorithm: Copy This Python Script

IMPORTANT: Write this exact script as `solve.py`, then run `python3 solve.py`. Only change the script if the input has special fields.

```python
import json

with open('jobs.json') as f:
    data = json.load(f)

num_machines = data['machines']
jobs = data['jobs']
downtime = data.get('downtime', [])

machine_free = [0] * num_machines
job_ready = {}
for job in jobs:
    job_ready[job['id']] = 0

assignments = []

# Build list of all operations with job_id
all_ops = []
for job in jobs:
    for op in job['operations']:
        all_ops.append((job['id'], op))

# Process operations: iterate job by job, operation by operation
for job in jobs:
    for op in job['operations']:
        jid = job['id']
        best_machine = None
        best_start = None
        best_dur = None

        for m_str, dur in op['duration'].items():
            m = int(m_str)
            t = max(machine_free[m], job_ready[jid])

            # Skip past any downtime windows on this machine
            changed = True
            while changed:
                changed = False
                for w in downtime:
                    if w['machine'] == m:
                        if t < w['end'] and t + dur > w['start']:
                            t = w['end']
                            changed = True

            end = t + dur
            if best_start is None or t < best_start or (t == best_start and dur < best_dur):
                best_start = t
                best_machine = m
                best_dur = dur

        end = best_start + best_dur
        assignments.append({
            'op_id': op['id'],
            'machine': best_machine,
            'start': best_start,
            'end': end
        })
        machine_free[best_machine] = end
        job_ready[jid] = end

makespan = max(a['end'] for a in assignments)

with open('schedule.json', 'w') as f:
    json.dump({'assignments': assignments, 'makespan': makespan}, f, indent=2)

print(f"Makespan: {makespan}")
```

## Steps

1. Read jobs.json to understand the problem size
2. Write `solve.py` with the script above (copy it exactly)
3. Run `python3 solve.py`
4. Read schedule.json to verify the output looks correct
