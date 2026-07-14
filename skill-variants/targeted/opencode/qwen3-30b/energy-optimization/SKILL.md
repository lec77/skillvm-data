---
name: energy-optimization
description: Solve DC power flow and economic dispatch problems. Use when computing bus angles, line flows, or minimizing generation costs.
---

## CRITICAL: Per-Unit Reactance

Network reactances are per-unit on Sbase=100 MVA. Loads are in MW. B-matrix entries must use `100 / reactance` (NOT `1 / reactance`). If angles are > 1.0 radian, you forgot to multiply by 100.

---

## DC Power Flow

Read `network.json`. The prompt tells you each generator's MW output. Slack bus (bus 0) angle=0, it absorbs remaining load. Solve for bus angles, compute line flows, write `power_flow.json`.

Write a file called `solve.js` with this content, then run `node solve.js`:

```javascript
var fs = require("fs");
var net = JSON.parse(fs.readFileSync("network.json", "utf-8"));
var buses = net.buses;
var lines = net.lines;
var n = buses.length;

var B = [];
for (var i = 0; i < n; i++) {
  B[i] = [];
  for (var j = 0; j < n; j++) B[i][j] = 0;
}
for (var k = 0; k < lines.length; k++) {
  var fr = lines[k].from;
  var to = lines[k].to;
  var b = 100 / lines[k].reactance;
  B[fr][fr] += b;
  B[to][to] += b;
  B[fr][to] -= b;
  B[to][fr] -= b;
}

var P = [];
for (var i = 0; i < n; i++) P[i] = 0;
for (var i = 0; i < buses.length; i++) {
  P[buses[i].id] -= (buses[i].load || 0);
}
// ADD GENERATOR DISPATCH HERE from the prompt:
// P[bus_number] += dispatch_MW;
// Do NOT add slack bus injection - it balances automatically.

var sz = n - 1;
var aug = [];
for (var i = 0; i < sz; i++) {
  aug[i] = [];
  for (var j = 0; j < sz; j++) aug[i][j] = B[i + 1][j + 1];
  aug[i][sz] = P[i + 1];
}
for (var col = 0; col < sz; col++) {
  var mr = col;
  for (var row = col + 1; row < sz; row++) {
    if (Math.abs(aug[row][col]) > Math.abs(aug[mr][col])) mr = row;
  }
  var tmp = aug[col]; aug[col] = aug[mr]; aug[mr] = tmp;
  for (var row = col + 1; row < sz; row++) {
    var f = aug[row][col] / aug[col][col];
    for (var j = col; j <= sz; j++) aug[row][j] -= f * aug[col][j];
  }
}
var x = [];
for (var i = sz - 1; i >= 0; i--) {
  x[i] = aug[i][sz];
  for (var j = i + 1; j < sz; j++) x[i] -= aug[i][j] * x[j];
  x[i] /= aug[i][i];
}

var bus_angles = [0];
for (var i = 0; i < sz; i++) bus_angles.push(x[i]);

var line_flows = [];
for (var k = 0; k < lines.length; k++) {
  var flow = 100 * (bus_angles[lines[k].from] - bus_angles[lines[k].to]) / lines[k].reactance;
  line_flows.push(flow);
}

var totalLoad = 0;
for (var i = 0; i < buses.length; i++) totalLoad += (buses[i].load || 0);
// slackGen = totalLoad - sum of non-slack dispatches
// generation = [slackGen, dispatch1, dispatch2, ...]

var out = new Object();
out.bus_angles = bus_angles;
out.line_flows = line_flows;
out.generation = generation;
fs.writeFileSync("power_flow.json", JSON.stringify(out, null, 2));
```

Output `power_flow.json`:
```json
{
  "bus_angles": [0.0, -0.065, -0.082, 0.004, -0.110],
  "line_flows": [65.3, 54.7, 13.9, 1.5, 28.5, 31.5],
  "generation": [120.0, 60.0]
}
```

Verify: `bus_angles[0]===0`, all `|angle|<0.5`, `sum(generation)===sum(loads)`, all `|flow|<=limit`.

---

## Economic Dispatch

Read `generators.json`. Minimize total cost meeting `total_demand`. Cost: `C = a*P^2 + b*P + c`. Use bisection on lambda. Write `dispatch.json`.

Write a file called `solve_ed.js` with this content, then run `node solve_ed.js`:

```javascript
var fs = require("fs");
var data = JSON.parse(fs.readFileSync("generators.json", "utf-8"));
var gens = data.generators;
var demand = data.total_demand;

var lo = Infinity;
var hi = -Infinity;
for (var i = 0; i < gens.length; i++) {
  var mcMin = 2 * gens[i].a * gens[i].min + gens[i].b;
  var mcMax = 2 * gens[i].a * gens[i].max + gens[i].b;
  if (mcMin < lo) lo = mcMin;
  if (mcMax > hi) hi = mcMax;
}

var dispatch = [];
var lambda = 0;
for (var iter = 0; iter < 200; iter++) {
  lambda = (lo + hi) / 2;
  dispatch = [];
  var total = 0;
  for (var i = 0; i < gens.length; i++) {
    var p = (lambda - gens[i].b) / (2 * gens[i].a);
    if (p < gens[i].min) p = gens[i].min;
    if (p > gens[i].max) p = gens[i].max;
    dispatch.push(p);
    total += p;
  }
  if (Math.abs(total - demand) < 0.0001) break;
  if (total < demand) lo = lambda;
  else hi = lambda;
}

var result = [];
var total_cost = 0;
for (var i = 0; i < gens.length; i++) {
  var p = dispatch[i];
  var cost = gens[i].a * p * p + gens[i].b * p + gens[i].c;
  var item = new Object();
  item.id = gens[i].id;
  item.power = p;
  item.cost = cost;
  result.push(item);
  total_cost += cost;
}

var out = new Object();
out.dispatch = result;
out.total_cost = total_cost;
out.lambda = lambda;
fs.writeFileSync("dispatch.json", JSON.stringify(out, null, 2));
```

Output `dispatch.json`:
```json
{
  "dispatch": [
    {"id": 0, "power": 100.0, "cost": 1340.0},
    {"id": 1, "power": 200.0, "cost": 1840.0},
    {"id": 2, "power": 20.0, "cost": 403.6},
    {"id": 3, "power": 180.0, "cost": 1722.0}
  ],
  "total_cost": 5305.6,
  "lambda": 8.8
}
```

Verify: `sum(power)===demand`, each `power` in `[min,max]`, each `cost===a*p^2+b*p+c`, `total_cost===sum(costs)`, `lambda>0`.
