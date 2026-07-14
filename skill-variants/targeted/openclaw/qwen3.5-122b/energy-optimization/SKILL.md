---
name: energy-optimization
description: Solve power systems optimization problems including DC power flow, economic dispatch, and optimal power flow. Use when computing bus angles, line flows, or minimizing generation costs.
---

## DC Power Flow

Solve B * theta = P for bus voltage angles, then compute line flows.

### CRITICAL: Per-Unit Conversion

When reactances are in per-unit (small decimals like 0.1, 0.15), you MUST convert power injections to per-unit too:

```
P_pu = P_MW / base_MVA     (use base_MVA = 100 unless specified)
```

After solving for theta (in radians), convert line flows back to MW:

```
flow_MW = (theta_i - theta_j) / x_ij * base_MVA
```

**If you skip this step, angles will be ~100x too large (e.g., -6.5 instead of -0.065).**

### Complete Python3 Script

IMPORTANT: Write a Python3 script and run it with `python3` (not `python`).

```python3
import numpy as np, json

with open('network.json') as f:
    net = json.load(f)

buses = net['buses']
lines = net['lines']
gens = net['generators']
n = len(buses)
base_MVA = 100.0

# 1. Build susceptance matrix B
B = np.zeros((n, n))
for line in lines:
    i, j = line['from'], line['to']
    b = 1.0 / line['reactance']
    B[i][i] += b; B[j][j] += b
    B[i][j] -= b; B[j][i] -= b

# 2. Net injection in PER-UNIT (divide MW by base_MVA)
P = np.zeros(n)
for bus in buses:
    P[bus['id']] -= bus.get('load', 0) / base_MVA
for gen in gens:
    P[gen['bus']] += gen.get('dispatch', 0) / base_MVA

# 3. Remove slack bus (bus 0), solve
B_red = B[1:, 1:]
P_red = P[1:]
theta_red = np.linalg.solve(B_red, P_red)
theta = np.concatenate([[0.0], theta_red])

# 4. Line flows in MW
line_flows = []
for line in lines:
    i, j = line['from'], line['to']
    flow = (theta[i] - theta[j]) / line['reactance'] * base_MVA
    line_flows.append(round(flow, 4))

# 5. Generation
total_load = sum(bus.get('load', 0) for bus in buses)
non_slack_gen = sum(gen.get('dispatch', 0) for gen in gens if gen['bus'] != 0)
slack_gen = total_load - non_slack_gen

result = {
    'bus_angles': [round(float(t), 6) for t in theta],
    'line_flows': line_flows,
    'generation': [round(slack_gen, 4), round(non_slack_gen, 4)]
}

with open('power_flow.json', 'w') as f:
    json.dump(result, f, indent=2)
print(json.dumps(result, indent=2))
```

Key checks: all |theta| < 1.0 rad; sum(generation) = sum(loads); |flow| <= line limit.

---

## Economic Dispatch

Minimize total cost while meeting demand. Use lambda iteration (bisection on marginal cost).

### IMPORTANT: Write dispatch.json directly

After computing the dispatch, write the JSON file directly using the write/file tool. Do NOT rely solely on Python exec to write the file — use the write tool to ensure the file is saved.

### Algorithm

At optimum, marginal cost `2*a*P + b = lambda` for unconstrained generators.
Solve `P = (lambda - b) / (2*a)`, clamped to [min, max].

Use bisection on lambda until total power = demand.

### Complete Python3 Script

```python3
import json

with open('generators.json') as f:
    data = json.load(f)

generators = data['generators']
total_demand = data['total_demand']

# Bisection on lambda (marginal cost)
lambda_lo = min(2*g['a']*g['min'] + g['b'] for g in generators)
lambda_hi = max(2*g['a']*g['max'] + g['b'] for g in generators)

for _ in range(1000):
    lam = (lambda_lo + lambda_hi) / 2.0
    dispatch = []
    for g in generators:
        p = (lam - g['b']) / (2 * g['a'])
        p = max(g['min'], min(g['max'], p))
        dispatch.append(p)
    total = sum(dispatch)
    if abs(total - total_demand) < 1e-6:
        break
    if total < total_demand:
        lambda_lo = lam
    else:
        lambda_hi = lam

# Build output
result = {'dispatch': [], 'total_cost': 0.0, 'lambda': round(lam, 6)}
for g, p in zip(generators, dispatch):
    cost = g['a'] * p**2 + g['b'] * p + g['c']
    result['dispatch'].append({'id': g['id'], 'power': round(p, 4), 'cost': round(cost, 4)})
    result['total_cost'] += cost
result['total_cost'] = round(result['total_cost'], 4)

with open('dispatch.json', 'w') as f:
    json.dump(result, f, indent=2)
print(json.dumps(result, indent=2))
```

After running the script, **verify dispatch.json exists** by reading it. If it doesn't exist or has wrong content, **write it directly using the write tool** with the computed values.

### Output Formats

**power_flow.json:**
```json
{"bus_angles": [0.0, -0.065, -0.082, -0.067, -0.111], "line_flows": [65.34, 54.66, 13.88, 1.46, 28.54, 31.46], "generation": [120.0, 60.0]}
```

**dispatch.json:**
```json
{"dispatch": [{"id": 0, "power": 100.0, "cost": 1340.0}, {"id": 1, "power": 200.0, "cost": 1840.0}], "total_cost": 5305.6, "lambda": 8.8}
```

### Validation Checklist

- [ ] All generator powers within [min, max] limits
- [ ] Total dispatched power = total_demand (within 0.1 MW)
- [ ] Individual cost = a*P^2 + b*P + c for each generator
- [ ] total_cost = sum of individual costs
- [ ] lambda > 0

## Common Mistakes

| Mistake | Fix |
|---|---|
| Using MW with per-unit reactances | ALWAYS divide MW by base_MVA (100) before solving B*theta=P |
| Forgetting theta[0] = 0 | Slack bus angle is always 0 |
| Not clamping P to [min, max] | Always clamp before summing |
| Using `python` command | Use `python3` |
| File not saved after exec | Verify file exists; if missing, write it with write tool |
| Wrong cost formula | Cost = a*P^2 + b*P + c, marginal = 2*a*P + b |
