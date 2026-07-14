---
name: energy-optimization
description: Solve power systems optimization problems including DC power flow, economic dispatch, and optimal power flow.
---

## Approach

Write a Node.js script to compute the answer, run it with `node script.js`. Do NOT read or run test files.

## DC Power Flow

Given network.json with buses, lines, generators: write `solve.js` that reads network.json, solves DC power flow, writes power_flow.json.

**IMPORTANT**: Reactances are per-unit but loads/generation are in MW. You MUST convert MW to per-unit by dividing by BASE_MVA=100 before solving angles, then convert line flows back to MW by multiplying by 100.

```javascript
const fs = require('fs');
const net = JSON.parse(fs.readFileSync('network.json', 'utf-8'));
const BASE = 100; // base MVA for per-unit conversion

const n = net.buses.length;
const P = new Array(n).fill(0);
for (const bus of net.buses) P[bus.id] -= (bus.load || 0) / BASE;

// Set non-slack generator dispatch from prompt (e.g. bus 3 = 60 MW)
const genDispatch = {}; // FILL FROM PROMPT: e.g. {3: 60}
for (const [busId, mw] of Object.entries(genDispatch)) P[Number(busId)] += mw / BASE;

// Slack bus picks up remainder
const totalLoad = net.buses.reduce((s, b) => s + (b.load || 0), 0);
const otherGen = Object.values(genDispatch).reduce((s, v) => s + v, 0);
const slackGen = totalLoad - otherGen;
const slackBus = net.buses.find(b => b.type === 'slack').id;
P[slackBus] += slackGen / BASE;

// Build B matrix
const B = Array.from({length: n}, () => new Array(n).fill(0));
for (const line of net.lines) {
  const b = 1.0 / line.reactance;
  B[line.from][line.from] += b; B[line.to][line.to] += b;
  B[line.from][line.to] -= b; B[line.to][line.from] -= b;
}

// Remove slack row/col, solve via Gaussian elimination
const idx = [];
for (let i = 0; i < n; i++) if (i !== slackBus) idx.push(i);
const m = idx.length;
const Br = idx.map(i => idx.map(j => B[i][j]));
const Pr = idx.map(i => P[i]);

for (let k = 0; k < m; k++) {
  for (let i = k + 1; i < m; i++) {
    const f = Br[i][k] / Br[k][k];
    for (let j = k; j < m; j++) Br[i][j] -= f * Br[k][j];
    Pr[i] -= f * Pr[k];
  }
}
const x = new Array(m).fill(0);
for (let i = m - 1; i >= 0; i--) {
  x[i] = Pr[i];
  for (let j = i + 1; j < m; j++) x[i] -= Br[i][j] * x[j];
  x[i] /= Br[i][i];
}

const theta = new Array(n).fill(0);
for (let k = 0; k < m; k++) theta[idx[k]] = x[k];

// Line flows in MW (multiply per-unit flow by BASE)
const flows = net.lines.map(l => (theta[l.from] - theta[l.to]) / l.reactance * BASE);

const generation = [slackGen];
for (const [_, mw] of Object.entries(genDispatch)) generation.push(mw);

fs.writeFileSync('power_flow.json', JSON.stringify({
  bus_angles: theta, line_flows: flows, generation
}, null, 2));
```

## Economic Dispatch

Given generators.json with generators array and total_demand: write `solve.js` using lambda iteration.

```javascript
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('generators.json', 'utf-8'));
const gens = data.generators;
const demand = data.total_demand;

let lo = Math.min(...gens.map(g => 2 * g.a * g.min + g.b));
let hi = Math.max(...gens.map(g => 2 * g.a * g.max + g.b));
let lam, dispatch;

for (let iter = 0; iter < 1000; iter++) {
  lam = (lo + hi) / 2;
  dispatch = gens.map(g => {
    let p = (lam - g.b) / (2 * g.a);
    return Math.max(g.min, Math.min(g.max, p));
  });
  const total = dispatch.reduce((s, p) => s + p, 0);
  if (Math.abs(total - demand) < 1e-6) break;
  if (total < demand) lo = lam; else hi = lam;
}

const result = {
  dispatch: gens.map((g, i) => ({
    id: i,
    power: Math.round(dispatch[i] * 1e6) / 1e6,
    cost: g.a * dispatch[i] ** 2 + g.b * dispatch[i] + g.c
  })),
  total_cost: gens.reduce((s, g, i) =>
    s + g.a * dispatch[i] ** 2 + g.b * dispatch[i] + g.c, 0),
  lambda: lam
};

fs.writeFileSync('dispatch.json', JSON.stringify(result, null, 2));
```

## Rules

1. Write a .js script, run with `node`, verify output file exists
2. Do NOT read or run .test.ts files
3. Slack generation = total_load - other_generation
4. Always clamp dispatch to [min, max]
5. Use BASE_MVA=100 for per-unit conversion in power flow
