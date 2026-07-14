---
name: energy-optimization
description: Solve DC power flow and economic dispatch. Compute bus angles, line flows, generator dispatch, minimize costs.
---

## DC Power Flow

Write a Python3 script, save it, then run it with `python3 script.py`.

IMPORTANT: Network uses per-unit reactances. Power values (MW) must be divided by S_base=100 before solving, then multiply flows by 100 to get MW.

Algorithm:
1. `slack_gen = total_load - sum(other_generation)` (in MW)
2. `P[i] = (gen_i - load_i) / 100` (convert to per-unit)
3. Build B-matrix from susceptance `b = 1/x` for each line
4. Remove slack bus row/col, solve `B_red * theta = P_red`
5. `flow_MW = (theta[from] - theta[to]) / x * 100`

Sanity check: all |theta| must be < 0.5 radians.

Output `power_flow.json`:
```json
{"bus_angles": [0.0, -0.05, ...], "line_flows": [65.3, ...], "generation": [120, 60]}
```

Complete Python3 script:

```python
import json

with open('network.json') as f:
    net = json.load(f)

n = len(net['buses'])
S = 100.0  # base power MVA

# Identify slack bus and compute generation
slack = next(b['id'] for b in net['buses'] if b['type'] == 'slack')
total_load = sum(b.get('load', 0) for b in net['buses'])
# Set non-slack generation from prompt (e.g. bus 3 = 60 MW)
gen_dispatch = {}  # fill from prompt: {bus_id: MW}
slack_gen = total_load - sum(gen_dispatch.values())

# Injection vector in per-unit
P = [0.0] * n
for b in net['buses']:
    P[b['id']] = -b.get('load', 0) / S
P[slack] += slack_gen / S
for bid, mw in gen_dispatch.items():
    P[bid] += mw / S

# B-matrix
B = [[0.0]*n for _ in range(n)]
for l in net['lines']:
    i, j, b = l['from'], l['to'], 1.0/l['reactance']
    B[i][i] += b; B[j][j] += b; B[i][j] -= b; B[j][i] -= b

# Remove slack, build augmented matrix
idx = [i for i in range(n) if i != slack]
m = len(idx)
A = [[B[idx[r]][idx[c]] for c in range(m)] + [P[idx[r]]] for r in range(m)]

for k in range(m):
    for i in range(k+1, m):
        f = A[i][k] / A[k][k]
        for j in range(k, m+1):
            A[i][j] -= f * A[k][j]
t = [0.0] * m
for i in range(m-1, -1, -1):
    s = A[i][m]
    for j in range(i+1, m):
        s -= A[i][j] * t[j]
    t[i] = s / A[i][i]

theta = [0.0] * n
for i, bi in enumerate(idx):
    theta[bi] = t[i]

flows = [(theta[l['from']] - theta[l['to']]) / l['reactance'] * S for l in net['lines']]
generation = [slack_gen] + [gen_dispatch[g['bus']] for g in net['generators'] if g['bus'] != slack]

with open('power_flow.json', 'w') as f:
    json.dump({"bus_angles": theta, "line_flows": flows, "generation": generation}, f, indent=2)
print("Done")
```

---

## Economic Dispatch

Cost: `C = a*P^2 + b*P + c`. At optimum, marginal cost `2*a*P + b = lambda` for unconstrained generators.

Write a Node.js script (`.js` file), then run with `node script.js`.

Output `dispatch.json`:
```json
{"dispatch": [{"id": 0, "power": 150.0, "cost": 1790.0}], "total_cost": 3630.0, "lambda": 9.2}
```

Complete Node.js script:

```javascript
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('generators.json', 'utf-8'));
const gens = data.generators;
const demand = data.total_demand;

let lo = Infinity, hi = -Infinity;
for (const g of gens) {
    lo = Math.min(lo, 2 * g.a * g.min + g.b);
    hi = Math.max(hi, 2 * g.a * g.max + g.b);
}

let powers = [];
for (let iter = 0; iter < 500; iter++) {
    const lam = (lo + hi) / 2;
    powers = [];
    let total = 0;
    for (const g of gens) {
        let p = (lam - g.b) / (2 * g.a);
        if (p < g.min) p = g.min;
        if (p > g.max) p = g.max;
        powers.push(p);
        total += p;
    }
    if (Math.abs(total - demand) < 0.0001) break;
    if (total < demand) lo = lam;
    else hi = lam;
}

const lam = (lo + hi) / 2;
const dispatchArr = [];
let totalCost = 0;
for (let i = 0; i < gens.length; i++) {
    const g = gens[i];
    const p = powers[i];
    const cost = g.a * p * p + g.b * p + g.c;
    dispatchArr.push({id: g.id, power: Math.round(p * 100) / 100, cost: Math.round(cost * 100) / 100});
    totalCost += cost;
}

const result = {
    dispatch: dispatchArr,
    total_cost: Math.round(totalCost * 100) / 100,
    lambda: Math.round(lam * 10000) / 10000
};

fs.writeFileSync('dispatch.json', JSON.stringify(result, null, 2));
console.log('Done');
```
