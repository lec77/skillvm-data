---
name: energy-optimization
description: Solve power systems optimization problems including DC power flow, economic dispatch, and optimal power flow. Use when computing bus angles, line flows, or minimizing generation costs.
---

## DC Power Flow

Linearized AC power flow: `P_ij = (theta_i - theta_j) / x_ij`

**Critical**: If reactances are per-unit, powers MUST also be per-unit. Use base MVA = 100. Divide all MW values by 100 before solving, then multiply results back.

### Algorithm (JavaScript — use this, not Python)

```javascript
const fs = require("fs");
const data = JSON.parse(fs.readFileSync("network.json", "utf-8"));
const { buses, lines, generators } = data;
const n = buses.length;

// Build B-matrix (susceptance matrix)
const B = Array.from({ length: n }, () => Array(n).fill(0));
for (const line of lines) {
  const b = 1.0 / line.reactance;
  B[line.from][line.from] += b;
  B[line.to][line.to] += b;
  B[line.from][line.to] -= b;
  B[line.to][line.from] -= b;
}

// Net injection vector P (generation - load) in PER-UNIT (divide MW by 100)
const BASE_MVA = 100;
const P = Array(n).fill(0);
for (const bus of buses) P[bus.id] -= (bus.load || 0) / BASE_MVA;
// Set known generation (e.g., bus 3 = 60 MW → 0.6 pu)
P[3] += 60 / BASE_MVA;

// Remove slack bus (bus 0): solve B_red * theta_red = P_red
// For small systems, use Gaussian elimination or Cramer's rule
const size = n - 1;
// Copy reduced system (rows/cols 1..n-1)
const A = [];
const b_vec = [];
for (let i = 1; i < n; i++) {
  A.push([]);
  for (let j = 1; j < n; j++) A[i - 1].push(B[i][j]);
  b_vec.push(P[i]);
}

// Gaussian elimination with partial pivoting
for (let col = 0; col < size; col++) {
  let maxRow = col;
  for (let row = col + 1; row < size; row++)
    if (Math.abs(A[row][col]) > Math.abs(A[maxRow][col])) maxRow = row;
  [A[col], A[maxRow]] = [A[maxRow], A[col]];
  [b_vec[col], b_vec[maxRow]] = [b_vec[maxRow], b_vec[col]];
  for (let row = col + 1; row < size; row++) {
    const factor = A[row][col] / A[col][col];
    for (let j = col; j < size; j++) A[row][j] -= factor * A[col][j];
    b_vec[row] -= factor * b_vec[col];
  }
}
// Back substitution
const theta_red = Array(size).fill(0);
for (let i = size - 1; i >= 0; i--) {
  let sum = b_vec[i];
  for (let j = i + 1; j < size; j++) sum -= A[i][j] * theta_red[j];
  theta_red[i] = sum / A[i][i];
}

// Full theta vector (bus 0 = slack = 0)
const theta = [0, ...theta_red];

// Line flows (MW) = (theta_i - theta_j) / x_ij * BASE_MVA
const line_flows = lines.map(
  (l) => ((theta[l.from] - theta[l.to]) / l.reactance) * BASE_MVA
);

// Slack bus generation = total_load - other_generation
const totalLoad = buses.reduce((s, b) => s + (b.load || 0), 0);
const otherGen = 60; // bus 3 generation in MW
const slackGen = totalLoad - otherGen;

const result = {
  bus_angles: theta,       // radians, all |theta| should be < 1.0
  line_flows: line_flows,  // MW, positive = from→to
  generation: [slackGen, otherGen],
};
fs.writeFileSync("power_flow.json", JSON.stringify(result, null, 2));
```

**Key points:**
- Slack bus (bus 0): theta = 0, absorbs power imbalance
- B-matrix: diagonal = sum of connected susceptances, off-diagonal = -susceptance
- Remove slack row/col before solving
- Convert MW ↔ per-unit: divide by BASE_MVA=100 before solving, multiply flows back after
- Verify: all |theta| < 1.0 rad, total generation = total load

## Economic Dispatch

Minimize total cost subject to power balance and generator limits.

Cost: `C_i(P_i) = a_i * P_i² + b_i * P_i + c_i`
Marginal cost: `dC/dP = 2 * a_i * P_i + b_i`

At optimum, all unconstrained generators have equal marginal cost = lambda.
Solve: `P_i = (lambda - b_i) / (2 * a_i)`, clamped to [min, max].

### Algorithm (JavaScript — COPY THIS EXACTLY, do not use Python)

Save as `solve.js` and run with `node solve.js`:

```javascript
const fs = require("fs");
const data = JSON.parse(fs.readFileSync("generators.json", "utf-8"));
const { generators, total_demand } = data;

// Lambda iteration (binary search)
let lo = Math.min(...generators.map((g) => 2 * g.a * g.min + g.b));
let hi = Math.max(...generators.map((g) => 2 * g.a * g.max + g.b));
let lam = 0;

for (let iter = 0; iter < 500; iter++) {
  lam = (lo + hi) / 2;
  const total = generators.reduce((sum, g) => {
    let p = (lam - g.b) / (2 * g.a);
    p = Math.max(g.min, Math.min(g.max, p));
    return sum + p;
  }, 0);
  if (Math.abs(total - total_demand) < 1e-10) break;
  if (total < total_demand) lo = lam;
  else hi = lam;
}

// Final dispatch — round power to 6 decimal places to avoid float noise
const dispatch = generators.map((g) => {
  let p = (lam - g.b) / (2 * g.a);
  p = Math.max(g.min, Math.min(g.max, p));
  p = Math.round(p * 1e6) / 1e6;  // round to 6 decimals
  const cost = g.a * p * p + g.b * p + g.c;
  return { id: g.id, power: p, cost: cost };
});

const total_cost = dispatch.reduce((s, d) => s + d.cost, 0);

fs.writeFileSync(
  "dispatch.json",
  JSON.stringify({ dispatch, total_cost, lambda: lam }, null, 2)
);
```

**Key points:**
- Bracket lambda between min and max marginal costs across all generators
- Binary search: if total power < demand, increase lambda; if > demand, decrease
- Always clamp each generator to [min, max] before summing
- Round power values to avoid floating-point noise in output
- Cost = a*P² + b*P + c (NOT marginal cost)
- total_cost = sum of all individual costs
- IMPORTANT: Every generator's power MUST be >= min and <= max

## Common Mistakes

| Mistake | Fix |
|---|---|
| Using MW with per-unit reactances | Divide MW by BASE_MVA (100) before solving DC power flow |
| Forgetting to fix slack bus angle | Set theta[0] = 0 before solving |
| Not removing slack row/column | Reduced B matrix excludes slack bus |
| Sign error in flow direction | P_ij = (theta_i - theta_j) / x_ij; positive = from i to j |
| Lambda bracket too narrow | Use min/max marginal costs across ALL generators |
| Forgetting generator limits | Always clamp P_i to [min, max] |
| Wrong cost formula | Cost is a*P² + b*P + c, marginal is 2*a*P + b |
| Using Python when JS is available | Use JavaScript with fs module — no dependencies needed |
