---
name: energy-optimization
description: Solve power systems optimization problems including DC power flow, economic dispatch, and optimal power flow. Use when computing bus angles, line flows, or minimizing generation costs.
---

## DC Power Flow

DC power flow linearizes AC power flow. Line flow between bus i and j:

```
P_ij = (theta_i - theta_j) / x_ij
```

**Slack bus** (bus 0): `theta_0 = 0`. It absorbs generation/load imbalance.

### CRITICAL: Per-Unit Conversion

When reactances are in per-unit (values like 0.08-0.15) and loads are in MW, you MUST convert loads to per-unit before solving. Use system base power S_base = 100 MVA:

```
P_pu = P_MW / S_base
```

Solve the B-matrix system with per-unit injections → angles come out in radians (small, < 1.0 rad). Then convert line flows back to MW:

```
flow_MW = flow_pu × S_base
```

**If you skip per-unit conversion, angles will be 100x too large and WRONG.**

### Complete Solution Algorithm

```python
import numpy as np
import json

with open('network.json') as f:
    data = json.load(f)

buses = data['buses']
lines = data['lines']
generators = data['generators']
n = len(buses)
S_base = 100.0  # MVA base power

# Build B-matrix from reactances
B = np.zeros((n, n))
for line in lines:
    i, j = line['from'], line['to']
    b = 1.0 / line['reactance']
    B[i,i] += b; B[j,j] += b
    B[i,j] -= b; B[j,i] -= b

# Net injection in PER-UNIT (generation - load) / S_base
P = np.zeros(n)
for bus in buses:
    P[bus['id']] -= bus.get('load', 0) / S_base
for gen in generators:
    dispatch_mw = gen.get('dispatch', gen.get('power', 0))
    P[gen['bus']] += dispatch_mw / S_base

# Solve reduced system (remove slack bus 0)
theta_red = np.linalg.solve(B[1:, 1:], P[1:])
theta = np.concatenate([[0.0], theta_red])

# Line flows: compute in per-unit, convert to MW
line_flows = []
for line in lines:
    flow_pu = (theta[line['from']] - theta[line['to']]) / line['reactance']
    line_flows.append(round(float(flow_pu * S_base), 6))

# Generation values in MW
total_load = sum(bus.get('load', 0) for bus in buses)
gen_dispatches = []
for gen in generators:
    if any(b.get('type') == 'slack' for b in buses if b['id'] == gen['bus']):
        # Slack bus picks up remaining load
        other_gen = sum(g.get('dispatch', g.get('power', 0))
                       for g in generators if g['bus'] != gen['bus'])
        gen_dispatches.append(round(total_load - other_gen, 6))
    else:
        gen_dispatches.append(gen.get('dispatch', gen.get('power', 0)))

# Validate: all |theta| < 1.0 rad
bus_angles = [round(float(a), 6) for a in theta]
for a in bus_angles:
    assert abs(a) < 1.0, f"Angle {a} rad too large"

output = {
    'bus_angles': bus_angles,
    'line_flows': line_flows,
    'generation': gen_dispatches
}
with open('power_flow.json', 'w') as f:
    json.dump(output, f, indent=2)
```

---

## Economic Dispatch

Minimize total generation cost meeting demand, respecting generator limits.

### Cost Model

```
C_i(P_i) = a_i * P_i^2 + b_i * P_i + c_i
Marginal cost: dC_i/dP_i = 2 * a_i * P_i + b_i
```

### Lambda Iteration (Bisection)

At optimum, unconstrained generators have equal marginal cost λ:
```
P_i = (lambda - b_i) / (2 * a_i)
```
Clamp generators at min/max limits.

```python
import json

with open('generators.json') as f:
    data = json.load(f)

generators = data['generators']
total_demand = data['total_demand']

# Bisection for lambda
lambda_lo = min(2*g['a']*g['min'] + g['b'] for g in generators)
lambda_hi = max(2*g['a']*g['max'] + g['b'] for g in generators)

for _ in range(500):
    lam = (lambda_lo + lambda_hi) / 2.0
    dispatch = []
    total = 0.0
    for g in generators:
        p = (lam - g['b']) / (2 * g['a'])
        p = max(float(g['min']), min(float(g['max']), p))  # CLAMP
        dispatch.append(p)
        total += p
    if abs(total - total_demand) < 1e-8:
        break
    if total < total_demand:
        lambda_lo = lam
    else:
        lambda_hi = lam

# Build output
result = []
total_cost = 0.0
for g, p in zip(generators, dispatch):
    cost = g['a'] * p**2 + g['b'] * p + g['c']
    result.append({'id': g['id'], 'power': round(p, 4), 'cost': round(cost, 4)})
    total_cost += cost

output = {
    'dispatch': result,
    'total_cost': round(total_cost, 4),
    'lambda': round(lam, 6)
}
with open('dispatch.json', 'w') as f:
    json.dump(output, f, indent=2)
```

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
    {"id": 0, "power": 150.0, "cost": 1790.0},
    {"id": 1, "power": 120.0, "cost": 1486.4}
  ],
  "total_cost": 3276.4,
  "lambda": 9.2
}
```

## Common Mistakes

| Mistake | Fix |
|---|---|
| Angles too large (>1 rad) | Convert loads to per-unit: P_pu = P_MW / 100 |
| Forgetting slack bus angle = 0 | Set theta[0] = 0 |
| Not removing slack row/column | Reduced B excludes bus 0 |
| Sign error in flow | P_ij = (theta_i - theta_j) / x_ij |
| Generator exceeds limits | Clamp: max(min, min(max, P)) |
| Wrong cost formula | Cost = a*P^2 + b*P + c |
