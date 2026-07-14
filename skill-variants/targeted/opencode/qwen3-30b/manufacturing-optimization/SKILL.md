---
name: manufacturing-optimization
description: Solve job-shop and flexible job-shop scheduling problems. Use when optimizing production schedules or manufacturing workflows.
---

# Flexible Job-Shop Scheduling (FJSP)

## What To Do

1. Read `jobs.json` from the current directory
2. Write a Node.js script `solve.js` that reads `jobs.json`, solves the scheduling problem, and writes `schedule.json`
3. Run the script with `node solve.js`

## The Script

Write this script as `solve.js`, then run it with `node solve.js`. IMPORTANT: Copy EXACTLY. Do NOT change anything.

```javascript
var fs = require("fs");
var data = JSON.parse(fs.readFileSync("jobs.json", "utf-8"));
var machines = data.machines;
var downtime = data.downtime || [];
var jobs = data.jobs;
var machineFree = new Array(machines).fill(0);
var jobReady = new Array(jobs.length).fill(0);
var opIds = [];
var opMachines = [];
var opStarts = [];
var opEnds = [];
var count = 0;
for (var j = 0; j < jobs.length; j++) {
  var job = jobs[j];
  for (var o = 0; o < job.operations.length; o++) {
    var op = job.operations[o];
    var keys = Object.keys(op.duration).map(Number);
    var bestM = -1;
    var bestS = 999999;
    var bestD = 999999;
    for (var e = 0; e < keys.length; e++) {
      var m = keys[e];
      var dur = op.duration[String(m)];
      var t = machineFree[m];
      if (jobReady[job.id] > t) t = jobReady[job.id];
      var fixed = false;
      while (!fixed) {
        fixed = true;
        for (var d = 0; d < downtime.length; d++) {
          var w = downtime[d];
          if (w.machine === m && t < w.end && t + dur > w.start) {
            t = w.end;
            fixed = false;
          }
        }
      }
      if (t < bestS || (t === bestS && dur < bestD)) {
        bestS = t;
        bestM = m;
        bestD = dur;
      }
    }
    opIds[count] = op.id;
    opMachines[count] = bestM;
    opStarts[count] = bestS;
    opEnds[count] = bestS + bestD;
    count++;
    machineFree[bestM] = bestS + bestD;
    jobReady[job.id] = bestS + bestD;
  }
}
var maxEnd = 0;
for (var i = 0; i < count; i++) {
  if (opEnds[i] > maxEnd) maxEnd = opEnds[i];
}
var lines = [];
for (var i = 0; i < count; i++) {
  lines.push('    ' + JSON.stringify(
    Object.assign(Object.create(null), {op_id: opIds[i], machine: opMachines[i], start: opStarts[i], end: opEnds[i]})
  ));
}
var out = '{\n  "assignments": [\n' + lines.join(",\n") + '\n  ],\n  "makespan": ' + maxEnd + '\n}\n';
fs.writeFileSync("schedule.json", out);
```

## Output Format

The `schedule.json` must have:
- `assignments`: array of objects, each with `op_id` (string like "0-0"), `machine` (integer), `start` (integer), `end` (integer)
- `makespan`: integer equal to the maximum `end` value across all assignments
