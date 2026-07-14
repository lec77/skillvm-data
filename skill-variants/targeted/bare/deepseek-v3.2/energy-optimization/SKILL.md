---
name: energy-optimization
description: Solve power systems optimization problems including DC power flow, economic dispatch, and optimal power flow. Use when computing bus angles, line flows, or minimizing generation costs.
---

## IMPORTANT: Output Strategy

Write output JSON files using the write_file tool DIRECTLY. Do NOT create intermediate scripts that write to output files - this risks floating-point imprecision in the output. Instead:
1. Read input data
2. Write a computation script that prints results to stdout (NOT to a file)
3. Parse the stdout results
4. Write the final JSON using write_file with clean, rounded values

## Economic Dispatch

Minimize total generation cost subject to power balance and generator limits.

### Cost Model

```
Cost:     C_i(P_i) = a_i * P_i^2 + b_i * P_i + c_i
Marginal: MC_i(P_i) = 2 * a_i * P_i + b_i
```

### Lambda Iteration Algorithm

At optimum, all unconstrained generators have equal marginal cost = lambda:
```
P_i = (lambda - b_i) / (2 * a_i)     then clamp to [min_i, max_i]
```

Binary search on lambda:
1. Set lo = min(2*a_i*min_i + b_i) across all generators
2. Set hi = max(2*a_i*max_i + b_i) across all generators
3. Iterate: lambda = (lo+hi)/2, compute each P_i, clamp to limits, sum total
4. If total < demand: lo = lambda, else: hi = lambda
5. Stop when |total - demand| < 1e-6

### Computation Script (prints to stdout only)

```javascript
// solve.js - prints JSON to stdout, does NOT write files
const data = JSON.parse(require('fs').readFileSync('generators.json', 'utf8'));
const gens = data.generators, demand = data.total_demand;

let lo = Math.min(...gens.map(g => 2*g.a*g.min + g.b));
let hi = Math.max(...gens.map(g => 2*g.a*g.max + g.b));
let powers, lam;

for (let i = 0; i < 200; i++) {
  lam = (lo + hi) / 2;
  powers = gens.map(g => Math.max(g.min, Math.min(g.max, (lam - g.b) / (2 * g.a))));
  const total = powers.reduce((s, p) => s + p, 0);
  if (Math.abs(total - demand) < 1e-6) break;
  if (total < demand) lo = lam; else hi = lam;
}

const dispatch = gens.map((g, i) => ({
  id: g.id,
  power: Math.round(powers[i] * 1e4) / 1e4,
  cost: Math.round((g.a * powers[i]**2 + g.b * powers[i] + g.c) * 1e4) / 1e4
}));
const total_cost = Math.round(dispatch.reduce((s, d) => s + d.cost, 0) * 1e4) / 1e4;

console.log(JSON.stringify({ dispatch, total_cost, lambda: Math.round(lam * 1e4) / 1e4 }));
```

Run with `node solve.js`, then use write_file to save the stdout output as dispatch.json.

### Output: `dispatch.json`

```json
{
  "dispatch": [
    {"id": 0, "power": 150.0, "cost": 1790.0},
    {"id": 1, "power": 200.0, "cost": 1840.0}
  ],
  "total_cost": 3630.0,
  "lambda": 9.2
}
```

### Verification Checklist

After writing dispatch.json, verify:
- Sum of power values = total_demand (within 0.1 MW)
- Every generator: min <= power <= max
- Each cost = a*power^2 + b*power + c (within 1.0)
- total_cost = sum of individual costs (within 1.0)
- lambda > 0

---

## DC Power Flow

DC power flow uses linear approximation. Line flow from bus i to j:
```
P_ij = (theta_i - theta_j) / x_ij
```

**CRITICAL: Per-Unit Conversion**
Reactances in network data are in per-unit on a 100 MVA base. You MUST convert MW to per-unit before solving:
```
P_pu = P_MW / 100
```
Solve B * theta = P_pu to get theta in RADIANS. Then convert line flows back to MW:
```
flow_MW = (theta_i - theta_j) / x_ij * 100
```
If your angles are > 1.0 radian, you forgot per-unit conversion!

### Algorithm

1. Build B-matrix (n×n) from line susceptances: for each line, b = 1/x_ij
   - B[i][i] += b, B[j][j] += b, B[i][j] -= b, B[j][i] -= b
2. Build injection vector P_pu: P_pu[bus] = (generation - load) / S_base, where S_base = 100
3. Fix slack bus angle = 0, remove its row/column → B_red, P_red
4. Solve B_red * theta_red = P_red (Gaussian elimination) → angles in radians
5. Line flows in MW: flow = (theta[i] - theta[j]) / x_ij * S_base
6. Slack generation = total_load - sum(other_generation)

### Computation Script (prints to stdout only)

```javascript
// flow.js - prints JSON to stdout, does NOT write files
const data = JSON.parse(require('fs').readFileSync('network.json', 'utf8'));
const n = data.buses.length;
const S_BASE = 100; // MVA base for per-unit conversion

// Build B-matrix
const B = Array.from({length: n}, () => new Array(n).fill(0));
for (const line of data.lines) {
  const b = 1.0 / line.reactance;
  B[line.from][line.from] += b; B[line.to][line.to] += b;
  B[line.from][line.to] -= b;   B[line.to][line.from] -= b;
}

// Net injection in PER-UNIT (divide MW by S_BASE)
const P = new Array(n).fill(0);
for (const bus of data.buses) P[bus.id] -= (bus.load || 0) / S_BASE;
// Add non-slack generation in per-unit
// IMPORTANT: Read the task prompt for which generators have fixed output
// Example: P[3] += 60 / S_BASE;  // bus 3 generates 60 MW

// Remove slack bus (index 0) → solve reduced system
const sz = n - 1;
const A = Array.from({length: sz}, (_, i) => [...Array.from({length: sz}, (_, j) => B[i+1][j+1]), P[i+1]]);

// Gaussian elimination with partial pivoting
for (let c = 0; c < sz; c++) {
  let mx = c;
  for (let r = c+1; r < sz; r++) if (Math.abs(A[r][c]) > Math.abs(A[mx][c])) mx = r;
  [A[c], A[mx]] = [A[mx], A[c]];
  for (let r = c+1; r < sz; r++) {
    const f = A[r][c] / A[c][c];
    for (let j = c; j <= sz; j++) A[r][j] -= f * A[c][j];
  }
}
// Back substitution → theta in RADIANS
const theta = [0]; // slack = 0
const t = new Array(sz).fill(0);
for (let i = sz-1; i >= 0; i--) {
  let s = A[i][sz];
  for (let j = i+1; j < sz; j++) s -= A[i][j] * t[j];
  t[i] = s / A[i][i];
}
theta.push(...t);

// Line flows in MW (multiply per-unit flow by S_BASE)
const flows = data.lines.map(l => (theta[l.from] - theta[l.to]) / l.reactance * S_BASE);

// Generation: slack absorbs imbalance
const totalLoad = data.buses.reduce((s, b) => s + (b.load || 0), 0);
// fixedGen = sum of all non-slack generation from task prompt
const slackGen = totalLoad - fixedGen;

console.log(JSON.stringify({
  bus_angles: theta.map(a => Math.round(a * 1e6) / 1e6),
  line_flows: flows.map(f => Math.round(f * 1e4) / 1e4),
  generation: [slackGen, fixedGen]
}));
```

### Output: `power_flow.json`

```json
{
  "bus_angles": [0.0, -0.123, -0.098, 0.045, -0.201],
  "line_flows": [75.4, 44.6, 12.1, 55.3, 30.0, 25.0],
  "generation": [120.0, 60.0]
}
```

- `bus_angles`: array of n floats in radians, index = bus id, slack bus = 0.0
- `line_flows`: array of floats in MW, one per line in input order
- `generation`: array with [slack_output, gen2_output, ...] matching generator order

### Verification Checklist

- Slack bus angle = exactly 0
- **All |theta| < 1.0 radian** — if angles are larger, you forgot per-unit conversion (divide P by S_BASE=100)
- Total generation = total load (within 1.0 MW)
- All |line_flow| <= line thermal limit
- Non-slack generators at their specified output

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Script writes output file directly | Print to stdout, use write_file for final JSON |
| Floating-point values in output | Round to 4 decimal places |
| Not fixing slack angle to 0 | Set theta[0] = 0 before solving |
| Wrong B-matrix indexing | Row/col indices must match bus IDs |
| Not removing slack from system | Remove row 0 and col 0 from B and P |
| Lambda bracket too narrow | Use min/max marginal costs across all generators |
| Not clamping generator power | Always clamp P_i to [min, max] |
| Wrong cost formula | Cost = a*P^2 + b*P + c, NOT marginal cost |
