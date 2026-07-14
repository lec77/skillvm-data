---
name: manufacturing-optimization
description: Solve job-shop and flexible job-shop scheduling problems with machine assignment, precedence constraints, and downtime windows. Use when optimizing production schedules or manufacturing workflows.
---

# Flexible Job-Shop Scheduling

Solve the scheduling problem by writing and running a Python script.

## IMPORTANT: Use execute_command to write and run a Python solver

Step 1: Use execute_command to write the Python solver:

```
cat > solve.py << 'PYEOF'
import json

with open('jobs.json') as f:
    data = json.load(f)

jobs = data['jobs']
downtime = data.get('downtime', [])
num_machines = data['machines']

machine_free = [0] * num_machines
job_ready = [0] * len(jobs)
assignments = []

# Build operation list with job index
remaining = []
for i, job in enumerate(jobs):
    remaining.append({'job': i, 'ops': job['operations'], 'idx': 0})

while remaining:
    remaining.sort(key=lambda x: job_ready[x['job']])
    entry = remaining[0]
    op = entry['ops'][entry['idx']]
    dur_map = op['duration']

    best_m = None
    best_s = float('inf')
    best_e = float('inf')

    for m_str, dur in dur_map.items():
        m = int(m_str)
        t = max(machine_free[m], job_ready[entry['job']])
        changed = True
        while changed:
            changed = False
            for w in downtime:
                if w['machine'] == m and t < w['end'] and t + dur > w['start']:
                    t = w['end']
                    changed = True
        end = t + dur
        if end < best_e:
            best_m = m
            best_s = t
            best_e = end

    assignments.append({'op_id': op['id'], 'machine': best_m, 'start': best_s, 'end': best_e})
    machine_free[best_m] = best_e
    job_ready[entry['job']] = best_e

    entry['idx'] += 1
    if entry['idx'] >= len(entry['ops']):
        remaining.remove(entry)

makespan = max(a['end'] for a in assignments)
with open('schedule.json', 'w') as f:
    json.dump({'assignments': assignments, 'makespan': makespan}, f, indent=2)
print(f'Done. Makespan: {makespan}')
PYEOF
python3 solve.py
```

Step 2: Run the above command with execute_command. It creates solve.py and runs it.

The script handles:
- Reading jobs.json (any number of machines, jobs, operations)
- Downtime windows (optional)
- Precedence constraints (operations in order within each job)
- Machine exclusivity (no overlapping operations on same machine)
- Outputs schedule.json with assignments and makespan
