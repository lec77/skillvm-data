---
name: energy-optimization
description: Solve DC power flow and economic dispatch problems. Use when computing bus angles, line flows, or minimizing generation costs.
---

## DC Power Flow — Step by Step

Given `network.json` with buses, lines (with reactance in per-unit), and generators:

**IMPORTANT: Use per-unit system with S_base = 100 MVA. Divide all MW values by 100 before solving, then multiply results back by 100 for MW output.**

### Step 1: Build B matrix (n×n where n = number of buses)

```python
import numpy as np, json

with open('network.json') as f:
    net = json.load(f)

buses = net['buses']
lines = net['lines']
n = len(buses)
S_BASE = 100.0  # MVA base for per-unit conversion

B = np.zeros((n, n))
for line in lines:
    i, j = line['from'], line['to']
    b = 1.0 / line['reactance']
    B[i][i] += b; B[j][j] += b
    B[i][j] -= b; B[j][i] -= b
```

### Step 2: Build injection vector P (per-unit)

```python
P = np.zeros(n)
for bus in buses:
    P[bus['id']] -= bus.get('load', 0) / S_BASE  # load in per-unit

# Add generator dispatch (per-unit)
# e.g., if generator at bus 3 produces 60 MW:
P[3] += 60.0 / S_BASE
```

### Step 3: Solve for angles (radians)

Remove slack bus (bus 0, theta=0) row and column:

```python
B_red = B[1:, 1:]
P_red = P[1:]
theta_red = np.linalg.solve(B_red, P_red)
theta = np.concatenate([[0.0], theta_red])  # angles in radians
```

**All angles should be small: |theta| < 1.0 radian. If angles are large, you forgot per-unit conversion.**

### Step 4: Compute line flows (MW)

```python
line_flows = []
for line in lines:
    i, j = line['from'], line['to']
    flow_pu = (theta[i] - theta[j]) / line['reactance']
    line_flows.append(flow_pu * S_BASE)  # convert back to MW
```

### Step 5: Compute slack generation

```python
slack_gen = 0.0
for k, line in enumerate(lines):
    if line['from'] == 0:
        slack_gen += line_flows[k]
    if line['to'] == 0:
        slack_gen -= line_flows[k]
```

### Step 6: Write output

```python
result = {
    "bus_angles": theta.tolist(),        # radians, bus 0 = 0.0
    "line_flows": line_flows,            # MW, positive = from→to
    "generation": [slack_gen, 60.0]      # [slack MW, other gen MW]
}
with open('power_flow.json', 'w') as f:
    json.dump(result, f, indent=2)
```

---

## Economic Dispatch — Step by Step

Given `generators.json` with generators having quadratic cost `C(P) = a*P² + b*P + c` and `[min, max]` limits:

### Step 1: Lambda iteration (bisection)

At optimum, all unconstrained generators have equal marginal cost: `2*a*P + b = lambda`, so `P = (lambda - b) / (2*a)`.

```python
import json

with open('generators.json') as f:
    data = json.load(f)
gens = data['generators']
demand = data['total_demand']

lo = min(2*g['a']*g['min'] + g['b'] for g in gens)
hi = max(2*g['a']*g['max'] + g['b'] for g in gens)

for _ in range(1000):
    lam = (lo + hi) / 2.0
    dispatch = []
    for g in gens:
        p = (lam - g['b']) / (2 * g['a'])
        p = max(g['min'], min(g['max'], p))  # MUST clamp to [min, max]
        dispatch.append(p)
    total = sum(dispatch)
    if abs(total - demand) < 1e-6:
        break
    if total < demand:
        lo = lam
    else:
        hi = lam
```

### Step 2: Compute costs and write output

```python
result_dispatch = []
total_cost = 0.0
for g, p in zip(gens, dispatch):
    cost = g['a'] * p**2 + g['b'] * p + g['c']
    result_dispatch.append({"id": g['id'], "power": p, "cost": cost})
    total_cost += cost

result = {
    "dispatch": result_dispatch,
    "total_cost": total_cost,
    "lambda": lam
}
with open('dispatch.json', 'w') as f:
    json.dump(result, f, indent=2)
```

**Do NOT round values.** Write full precision floats.
