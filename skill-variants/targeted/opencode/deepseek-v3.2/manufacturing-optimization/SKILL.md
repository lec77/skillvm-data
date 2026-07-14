---
name: manufacturing-optimization
description: Solve job-shop and flexible job-shop scheduling problems with machine assignment, precedence constraints, and downtime windows. Use when optimizing production schedules or manufacturing workflows.
---

# FJSP Solver

Solve Flexible Job-Shop Scheduling by writing a Node.js script that reads `jobs.json` and writes `schedule.json`.

## Input format (jobs.json)

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

## Output format (schedule.json)

```json
{
  "assignments": [
    {"op_id": "0-0", "machine": 0, "start": 0, "end": 3},
    {"op_id": "0-1", "machine": 2, "start": 3, "end": 8}
  ],
  "makespan": 8
}
```

## Complete solver script

Write this script as `solve.js` and run it with `node solve.js`:

```javascript
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('jobs.json', 'utf-8'));

const machineFree = new Array(data.machines).fill(0);
const jobReady = {};
data.jobs.forEach(j => jobReady[j.id] = 0);
const downtime = data.downtime || [];
const assignments = [];

// Build operation queue: process all jobs round-robin, one op at a time
const opQueues = data.jobs.map(j => ({ jobId: j.id, ops: [...j.operations], idx: 0 }));
let remaining = opQueues.reduce((s, q) => s + q.ops.length, 0);

while (remaining > 0) {
  let bestOp = null, bestMach = -1, bestStart = Infinity, bestEnd = Infinity, bestQueue = -1;

  for (let qi = 0; qi < opQueues.length; qi++) {
    const q = opQueues[qi];
    if (q.idx >= q.ops.length) continue;
    const op = q.ops[q.idx];

    for (const [machStr, dur] of Object.entries(op.duration)) {
      const mach = parseInt(machStr);
      let t = Math.max(machineFree[mach], jobReady[q.jobId]);

      // Skip past any downtime windows that overlap
      let shifted = true;
      while (shifted) {
        shifted = false;
        for (const w of downtime) {
          if (w.machine === mach && t < w.end && t + dur > w.start) {
            t = w.end;
            shifted = true;
          }
        }
      }

      const end = t + dur;
      if (end < bestEnd || (end === bestEnd && t < bestStart)) {
        bestOp = op; bestMach = mach; bestStart = t; bestEnd = end; bestQueue = qi;
      }
    }
  }

  assignments.push({ op_id: bestOp.id, machine: bestMach, start: bestStart, end: bestEnd });
  machineFree[bestMach] = bestEnd;
  jobReady[opQueues[bestQueue].jobId] = bestEnd;
  opQueues[bestQueue].idx++;
  remaining--;
}

const makespan = Math.max(...assignments.map(a => a.end));
fs.writeFileSync('schedule.json', JSON.stringify({ assignments, makespan }, null, 2));
console.log('Schedule written. Makespan:', makespan);
```

## Rules

1. **Precedence**: within a job, each operation must finish before the next starts
2. **Machine exclusivity**: only one operation per machine at a time (no overlapping time ranges)
3. **Downtime**: operations must not overlap `[start, end)` maintenance windows
4. **makespan** = max end time across all assignments
