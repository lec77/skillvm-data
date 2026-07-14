---
name: manufacturing-optimization
description: Solve job-shop and flexible job-shop scheduling problems with machine assignment, precedence constraints, and downtime windows. Use when optimizing production schedules or manufacturing workflows.
---

# FJSP Scheduling — Write a Node.js Script

**IMPORTANT: Always write and execute a solver script. Never compute schedules by hand.**

## Steps

1. Read `jobs.json` — it has: `machines` (count), `jobs` (array with operations), optional `downtime` (array of `{machine, start, end}`)
2. Write a `solver.js` script (see template below)
3. Run it with `node solver.js`
4. It writes `schedule.json`

## Solver Template (Node.js)

```javascript
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('jobs.json', 'utf-8'));

const machineFree = {}; // machine_id -> earliest free time
for (let i = 0; i < data.machines; i++) machineFree[i] = 0;

const jobReady = {}; // job_id -> earliest ready time
data.jobs.forEach(j => jobReady[j.id] = 0);

const downtime = data.downtime || [];

// Find earliest feasible start on a machine, avoiding downtime
function earliestStart(machine, duration, readyTime) {
  let t = Math.max(machineFree[machine], readyTime);
  // Keep shifting past downtime windows until no overlap
  let changed = true;
  while (changed) {
    changed = false;
    for (const w of downtime) {
      if (w.machine === machine && t < w.end && t + duration > w.start) {
        t = w.end;
        changed = true;
      }
    }
  }
  return t;
}

const assignments = [];

// Process all jobs round-robin by operation index
const maxOps = Math.max(...data.jobs.map(j => j.operations.length));
for (let opIdx = 0; opIdx < maxOps; opIdx++) {
  for (const job of data.jobs) {
    if (opIdx >= job.operations.length) continue;
    const op = job.operations[opIdx];
    const eligibleMachines = Object.keys(op.duration).map(Number);

    let bestMachine = -1, bestStart = Infinity, bestDur = Infinity;
    for (const m of eligibleMachines) {
      const dur = op.duration[String(m)];
      const start = earliestStart(m, dur, jobReady[job.id]);
      if (start + dur < bestStart + bestDur) {
        bestMachine = m;
        bestStart = start;
        bestDur = dur;
      }
    }

    assignments.push({
      op_id: op.id,
      machine: bestMachine,
      start: bestStart,
      end: bestStart + bestDur,
    });
    machineFree[bestMachine] = bestStart + bestDur;
    jobReady[job.id] = bestStart + bestDur;
  }
}

const makespan = Math.max(...assignments.map(a => a.end));
fs.writeFileSync('schedule.json', JSON.stringify({ assignments, makespan }, null, 2));
console.log('Makespan:', makespan);
```

## Output Format — `schedule.json`

```json
{
  "assignments": [
    { "op_id": "0-0", "machine": 1, "start": 0, "end": 7 }
  ],
  "makespan": 34
}
```

- `op_id`: matches operation `id` from input
- `machine`: integer
- `start`, `end`: integers (time units)
- `makespan`: max `end` across all assignments

## Key Rules

- Precedence: within a job, each operation starts after the previous one ends
- Machine exclusivity: one operation per machine at a time
- Downtime: no operation may overlap any `{machine, start, end}` window
- Prefer machines with shorter processing time when tied on start time
- Makespan = `Math.max(...assignments.map(a => a.end))`
