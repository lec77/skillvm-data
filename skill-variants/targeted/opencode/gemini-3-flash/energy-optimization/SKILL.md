---
name: energy-optimization
description: Solve DC power flow and economic dispatch problems. Use when computing bus angles, line flows, or minimizing generation costs.
---

## DC Power Flow

Linearized power flow: `P_ij = (theta_i - theta_j) / x_ij`

**CRITICAL: Per-unit conversion is required.** Reactances in the input are in per-unit on a 100 MVA base. Loads/generation are in MW. You MUST convert MW to per-unit by dividing by S_base=100 before solving. After solving, convert line flows back to MW by multiplying by S_base.

**Angles are in RADIANS. Correct values are small (< 0.5 radians). If you get angles > 1.0, you forgot per-unit conversion.**

### Step-by-step Algorithm

1. Set `S_base = 100.0` (100 MVA base)
2. Build susceptance matrix B from line reactances: `b_ij = 1/x_ij`
3. Compute net injection in MW: `P_mw[i] = generation[i] - load[i]`
4. Convert to per-unit: `P_pu = P_mw / S_base`
5. Slack bus (bus 0): angle fixed at 0
6. Remove slack row/column → B_reduced, P_pu_reduced
7. Solve: `theta = numpy.linalg.solve(B_reduced, P_pu_reduced)` → angles in radians
8. Line flows in MW: `flow_mw = (theta[from] - theta[to]) / reactance * S_base`
9. Slack generation = total_load - other_generation (in MW)

**Use `numpy` for matrix operations. Write a Python script, run it, save output as JSON.**

```python
import numpy as np, json

S_base = 100.0  # 100 MVA base - REQUIRED for per-unit conversion

with open("network.json") as f:
    data = json.load(f)

buses = data["buses"]
lines = data["lines"]
generators = data["generators"]
n = len(buses)

# Build B-matrix (susceptance)
B = np.zeros((n, n))
for line in lines:
    i, j = line["from"], line["to"]
    b = 1.0 / line["reactance"]
    B[i][i] += b;  B[j][j] += b
    B[i][j] -= b;  B[j][i] -= b

# Net injection in MW, then convert to per-unit
P_mw = np.zeros(n)
for bus in buses:
    P_mw[bus["id"]] -= bus.get("load", 0)
for gen in generators:
    P_mw[gen["bus"]] += gen.get("dispatch", 0)
P_pu = P_mw / S_base  # Convert MW to per-unit

# Remove slack bus (bus 0) and solve
B_red = B[1:, 1:]
P_red = P_pu[1:]
theta_red = np.linalg.solve(B_red, P_red)
theta = np.concatenate([[0.0], theta_red])  # slack angle = 0 radians

# Line flows in MW
line_flows = []
for line in lines:
    flow_pu = (theta[line["from"]] - theta[line["to"]]) / line["reactance"]
    line_flows.append(float(flow_pu * S_base))  # Convert back to MW

# Generation
total_load = sum(bus.get("load", 0) for bus in buses)
other_gen = sum(g.get("dispatch", 0) for g in generators if g["bus"] != 0)
slack_gen = total_load - other_gen

generation = [float(slack_gen)]
for g in generators:
    if g["bus"] != 0:
        generation.append(float(g.get("dispatch", 0)))

result = {
    "bus_angles": [float(a) for a in theta],
    "line_flows": line_flows,
    "generation": generation
}
with open("power_flow.json", "w") as f:
    json.dump(result, f, indent=2)
```

### Output: `power_flow.json`

```json
{
  "bus_angles": [0.0, -0.123, -0.098, 0.045, -0.201],
  "line_flows": [75.4, 44.6, 12.1, 55.3, 30.0, 25.0],
  "generation": [120.0, 60.0]
}
```

- `bus_angles`: one per bus, in RADIANS, slack bus = 0.0
- `line_flows`: one per line in input order
- `generation`: MW per generator

---

## Economic Dispatch

Minimize `sum(a_i * P_i^2 + b_i * P_i + c_i)` subject to `sum(P_i) = demand` and `min <= P_i <= max`.

### Lambda Iteration Algorithm

At optimum, unconstrained generators share equal marginal cost lambda:
- `P_i = (lambda - b_i) / (2 * a_i)`, then clamp to [min, max]

**Write a Python script to solve this. Always clamp P_i to [min, max].**

```python
import json

with open("generators.json") as f:
    data = json.load(f)

generators = data["generators"]
total_demand = data["total_demand"]

# Bracket lambda using marginal costs at min/max output
lambda_lo = min(2*g["a"]*g["min"] + g["b"] for g in generators)
lambda_hi = max(2*g["a"]*g["max"] + g["b"] for g in generators)

for _ in range(500):
    lam = (lambda_lo + lambda_hi) / 2.0
    total = 0.0
    dispatch = []
    for g in generators:
        p = (lam - g["b"]) / (2 * g["a"])
        p = max(g["min"], min(g["max"], p))  # MUST clamp to limits
        dispatch.append(p)
        total += p
    if abs(total - total_demand) < 1e-6:
        break
    if total < total_demand:
        lambda_lo = lam
    else:
        lambda_hi = lam

# Compute costs
result_dispatch = []
total_cost = 0.0
for g, p in zip(generators, dispatch):
    cost = g["a"] * p**2 + g["b"] * p + g["c"]
    result_dispatch.append({"id": g["id"], "power": float(p), "cost": float(cost)})
    total_cost += cost

output = {
    "dispatch": result_dispatch,
    "total_cost": float(total_cost),
    "lambda": float(lam)
}
with open("dispatch.json", "w") as f:
    json.dump(output, f, indent=2)
```

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

- `dispatch`: array of `{id, power, cost}` per generator
- `total_cost`: sum of all individual costs
- `lambda`: optimal incremental cost
- All values must be numbers

## Common Mistakes

| Mistake | Fix |
|---|---|
| Angles too large (> 1 rad) | Convert MW to per-unit: `P_pu = P_mw / 100` before solving |
| Slack bus angle not 0 | Set theta[0] = 0 before solving |
| Not removing slack row/col | Reduced B excludes slack bus |
| Sign error in flow | `P_ij = (theta_i - theta_j) / x_ij` |
| Line flows in wrong units | Multiply per-unit flow by S_base=100 to get MW |
| Not clamping gen limits | Always: `p = max(min_p, min(max_p, p))` |
| Wrong cost formula | `a*P^2 + b*P + c`, marginal = `2*a*P + b` |
