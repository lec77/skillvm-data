---
name: energy-optimization
description: Solve power systems optimization problems including DC power flow, economic dispatch, and optimal power flow. Use when computing bus angles, line flows, or minimizing generation costs.
---

## CRITICAL RULES

1. **ALWAYS write and execute a Python script** — never compute results mentally
2. **DC power flow: use per-unit** — divide all MW values by Sbase=100 before solving B*theta=P, then multiply flows back by 100 to get MW
3. **Angles must be small** — correct DC power flow angles are typically |theta| < 0.5 radians. If you get angles > 1.0, you forgot per-unit conversion

---

## DC Power Flow

For line between bus i and bus j with reactance x_ij:
```
P_ij = (theta_i - theta_j) / x_ij    (in per-unit)
```

### Step-by-step algorithm (write as Python script):

```python
import numpy as np, json

with open('network.json') as f:
    net = json.load(f)

buses = net['buses']
lines = net['lines']
n = len(buses)
Sbase = 100.0  # MVA base — CRITICAL

# 1. Build B-matrix (susceptance matrix)
B = np.zeros((n, n))
for line in lines:
    i, j = line['from'], line['to']
    b = 1.0 / line['reactance']
    B[i,i] += b; B[j,j] += b
    B[i,j] -= b; B[j,i] -= b

# 2. Net power injection in PER-UNIT (generation - load) / Sbase
P = np.zeros(n)
for bus in buses:
    P[bus['id']] -= bus.get('load', 0) / Sbase
# Add known generation (NOT slack bus)
# Example: if bus 3 generates 60 MW:
# P[3] += 60.0 / Sbase

# 3. Remove slack bus (bus 0) row/column, solve
B_red = B[1:, 1:]
P_red = P[1:]
theta_red = np.linalg.solve(B_red, P_red)
theta = np.concatenate([[0.0], theta_red])  # slack angle = 0

# 4. Compute line flows in MW
line_flows = []
for line in lines:
    i, j = line['from'], line['to']
    flow_pu = (theta[i] - theta[j]) / line['reactance']
    line_flows.append(flow_pu * Sbase)  # convert back to MW

# 5. Slack generation = total_load - other_generation
total_load = sum(bus.get('load', 0) for bus in buses)
# slack_gen = total_load - sum_of_other_generators
```

### Key points:
- Slack bus angle = 0, slack bus absorbs power mismatch
- All angles should be small (< 0.5 rad). If not, check per-unit conversion
- Line flow positive = from→to direction
- generation array = [slack_output, other_gen_output]

---

## Economic Dispatch

Minimize total cost meeting demand, respecting generator min/max limits.

### Cost curve per generator:
```
C_i(P_i) = a_i * P_i^2 + b_i * P_i + c_i
Marginal cost: dC_i/dP_i = 2 * a_i * P_i + b_i
```

### Lambda iteration algorithm (write and execute as Python script):

```python
import json

with open('generators.json') as f:
    data = json.load(f)

gens = data['generators']
demand = float(data['total_demand'])

# Binary search for lambda where total dispatch = demand
lo = min(2.0*g['a']*g['min'] + g['b'] for g in gens)
hi = max(2.0*g['a']*g['max'] + g['b'] for g in gens)

for _ in range(500):
    lam = (lo + hi) / 2.0
    powers = []
    for g in gens:
        p = (lam - g['b']) / (2.0 * g['a'])
        p = max(float(g['min']), min(float(g['max']), p))  # clamp to limits as float
        powers.append(p)
    total = sum(powers)
    if abs(total - demand) < 1e-8:
        break
    if total < demand:
        lo = lam
    else:
        hi = lam

# Compute costs: C = a*P^2 + b*P + c
dispatch = []
for g, p in zip(gens, powers):
    cost = g['a'] * p**2 + g['b'] * p + g['c']
    dispatch.append({'id': g['id'], 'power': round(p, 4), 'cost': round(cost, 4)})

total_cost = sum(d['cost'] for d in dispatch)

result = {'dispatch': dispatch, 'total_cost': round(total_cost, 4), 'lambda': round(lam, 4)}
with open('dispatch.json', 'w') as f:
    json.dump(result, f, indent=2)
```

### Key points:
- At optimum, all unconstrained generators have equal marginal cost = lambda
- Generators at min/max limits are fixed; lambda set by remaining generators
- Cost formula: `a*P^2 + b*P + c` (quadratic, NOT linear)
- Total cost = sum of individual generator costs
- Lambda is positive (typically 7-12 range for typical systems)

---

## Output Formats

### power_flow.json
```json
{
  "bus_angles": [0.0, -0.065, -0.082, -0.067, -0.111],
  "line_flows": [65.3, 54.7, 13.9, 1.5, 28.5, 31.5],
  "generation": [120.0, 60.0]
}
```

### dispatch.json
```json
{
  "dispatch": [
    {"id": 0, "power": 100.0, "cost": 1340.0},
    {"id": 1, "power": 200.0, "cost": 1840.0}
  ],
  "total_cost": 3180.0,
  "lambda": 8.8
}
```

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Using MW directly in B*theta=P | Divide all power by Sbase=100 before solving, multiply flows back |
| Angles > 1.0 radian | You forgot per-unit conversion. Correct angles are < 0.5 rad |
| Computing results mentally | ALWAYS write a Python script and execute it |
| Wrong cost values | Cost = a*P² + b*P + c. Verify: for P=100, a=0.004, b=8, c=500 → cost=1340 |
| Forgetting generator limits | Clamp P to [min, max] in lambda iteration |
| Sign error in flow | P_ij = (theta_i - theta_j) / x_ij; positive = i→j |
