---
name: manufacturing-optimization
description: Solve job-shop and flexible job-shop scheduling problems with machine assignment, precedence constraints, and downtime windows. Use when optimizing production schedules or manufacturing workflows.
---

# Flexible Job-Shop Scheduling (FJSP)

Assign operations to machines and set start times to minimize makespan (max end time).

## Input Format (jobs.json)

```json
{
  "machines": 3,
  "downtime": [{"machine": 0, "start": 10, "end": 15}],
  "jobs": [
    {"id": 0, "operations": [
      {"id": "0-0", "duration": {"0": 5, "1": 7}},
      {"id": "0-1", "duration": {"1": 4, "2": 6}}
    ]}
  ]
}
```

**IMPORTANT field names:**
- Each operation has `"id"` (string like `"0-0"`) and `"duration"` (NOT `"durations"`)
- `"duration"` is a map of `"machine_id_string": processing_time` — keys are strings
- `"downtime"` is optional — may not exist in all inputs

## Constraints

1. **Precedence**: operations within a job run in order — op[i] must finish before op[i+1] starts
2. **Machine exclusivity**: one operation per machine at a time — no overlapping time intervals
3. **Downtime**: operations must not overlap any `[start, end)` downtime window on their assigned machine

## Solution: Node.js Script

Write and run a `.js` file (NOT Python). Use this exact approach:

```javascript
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('jobs.json', 'utf-8'));

const numMachines = data.machines;
const jobs = data.jobs;
const downtime = data.downtime || [];

// Track when each machine becomes free and when each job's next op can start
const machineFree = new Array(numMachines).fill(0);
const jobReady = {};
const jobOpIdx = {};
for (const job of jobs) {
  jobReady[job.id] = 0;
  jobOpIdx[job.id] = 0;
}

const assignments = [];
const totalOps = jobs.reduce((s, j) => s + j.operations.length, 0);

function earliestStart(machine, duration, readyTime) {
  let t = Math.max(machineFree[machine], readyTime);
  // Check downtime windows — push past any overlap
  for (const w of downtime) {
    if (w.machine === machine) {
      if (t < w.end && t + duration > w.start) {
        t = w.end;
      }
    }
  }
  // Re-check after shift (a second window might now overlap)
  for (const w of downtime) {
    if (w.machine === machine) {
      if (t < w.end && t + duration > w.start) {
        t = w.end;
      }
    }
  }
  return t;
}

while (assignments.length < totalOps) {
  let bestEnd = Infinity, bestStart = 0, bestMachine = -1, bestOp = null, bestJobId = -1;

  for (const job of jobs) {
    const idx = jobOpIdx[job.id];
    if (idx >= job.operations.length) continue;
    const op = job.operations[idx];
    const ready = jobReady[job.id];

    // op.duration keys are strings like "0", "1" — these are eligible machine IDs
    for (const [mStr, dur] of Object.entries(op.duration)) {
      const m = parseInt(mStr);
      const start = earliestStart(m, dur, ready);
      const end = start + dur;
      if (end < bestEnd || (end === bestEnd && dur < (bestOp ? bestOp._bestDur : Infinity))) {
        bestEnd = end;
        bestStart = start;
        bestMachine = m;
        bestOp = op;
        bestOp._bestDur = dur;
        bestJobId = job.id;
      }
    }
  }

  assignments.push({
    op_id: bestOp.id,
    machine: bestMachine,
    start: bestStart,
    end: bestEnd
  });
  machineFree[bestMachine] = bestEnd;
  jobReady[bestJobId] = bestEnd;
  jobOpIdx[bestJobId]++;
}

const makespan = Math.max(...assignments.map(a => a.end));
fs.writeFileSync('schedule.json', JSON.stringify({ assignments, makespan }, null, 2));
```

## Output Format (schedule.json)

```json
{
  "assignments": [
    {"op_id": "0-0", "machine": 1, "start": 0, "end": 7},
    {"op_id": "0-1", "machine": 2, "start": 7, "end": 13}
  ],
  "makespan": 34
}
```

- `op_id`: must match the operation `id` from input
- `machine`: integer
- `start`, `end`: integers (end = start + duration on chosen machine)
- `makespan`: `Math.max(...assignments.map(a => a.end))`

## Checklist

1. Read `jobs.json`
2. Write and run a Node.js `.js` script using the greedy algorithm above
3. Verify `schedule.json` was created and has correct structure
4. Confirm: all operations present, precedence valid, no machine overlaps, no downtime overlaps
