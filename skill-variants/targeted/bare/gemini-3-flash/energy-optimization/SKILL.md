---
name: energy-optimization
description: Solve power systems optimization problems including DC power flow, economic dispatch, and optimal power flow. Use when computing bus angles, line flows, or minimizing generation costs.
---

## DC Power Flow

Linearized AC power flow. Line flow between bus i and bus j:

```
P_ij = (theta_i - theta_j) / x_ij
```

**CRITICAL: Per-unit conversion.** If loads are in MW and reactances are in per-unit, you MUST convert powers to per-unit before solving. Use base MVA = 100 unless stated otherwise:

```
P_pu = P_MW / 100
```

After solving for angles (which will be in radians, typically |theta| < 0.5), convert line flows back to MW:

```
flow_MW = flow_pu * 100
```

### Slack Bus

Bus 0 is the slack bus: `theta_0 = 0`. It absorbs generation/load imbalance.

### Algorithm (Python)

```python
import numpy as np, json

def dc_power_flow(buses, lines, generators):
    n = len(buses)
    BASE_MVA = 100.0  # per-unit base

    # Build B matrix from line susceptances
    B = np.zeros((n, n))
    for line in lines:
        i, j = line["from"], line["to"]
        b = 1.0 / line["reactance"]
        B[i][i] += b;  B[j][j] += b
        B[i][j] -= b;  B[j][i] -= b

    # Net injection in PER-UNIT (divide MW by BASE_MVA)
    P = np.zeros(n)
    for bus in buses:
        P[bus["id"]] -= bus.get("load", 0) / BASE_MVA
    for gen in generators:
        P[gen["bus"]] += gen.get("dispatch", 0) / BASE_MVA

    # Remove slack bus (row/col 0), solve reduced system
    theta = np.zeros(n)
    theta[1:] = np.linalg.solve(B[1:, 1:], P[1:])

    # Line flows in MW (convert back from per-unit)
    flows_mw = []
    for line in lines:
        i, j = line["from"], line["to"]
        flow_pu = (theta[i] - theta[j]) / line["reactance"]
        flows_mw.append(flow_pu * BASE_MVA)

    # Slack generation = total_load - other_gen (in MW)
    total_load = sum(bus.get("load", 0) for bus in buses)
    other_gen = sum(g.get("dispatch", 0) for g in generators if g["bus"] != 0)
    slack_gen = total_load - other_gen

    return theta.tolist(), flows_mw, [slack_gen, other_gen]
```

### Output: `power_flow.json`

```json
{
  "bus_angles": [0.0, -0.065, -0.082, -0.067, -0.111],
  "line_flows": [65.3, 54.7, 13.9, 1.5, 28.5, 31.5],
  "generation": [120.0, 60.0]
}
```

- `bus_angles`: array of n angles in **radians** (all |theta| < 1.0)
- `line_flows`: array in **MW**, one per line in input order, positive = from→to
- `generation`: array in **MW**, [slack_bus_gen, other_gen...]

---

## Economic Dispatch

Minimize total generation cost subject to power balance and generator limits.

### Cost Model

```
C_i(P_i) = a_i * P_i^2 + b_i * P_i + c_i
Marginal cost: dC_i/dP_i = 2 * a_i * P_i + b_i
```

### Equal Incremental Cost (Lambda Iteration)

At optimum, all unconstrained generators have the same marginal cost lambda:

```
P_i = (lambda - b_i) / (2 * a_i)
```

Clamp each P_i to [min_i, max_i]. Use bisection on lambda until sum(P_i) = demand.

### Algorithm (Python)

```python
import json

def economic_dispatch(generators, total_demand):
    # Bracket lambda using marginal costs at min and max output
    lambda_lo = min(2*g["a"]*g["min"] + g["b"] for g in generators)
    lambda_hi = max(2*g["a"]*g["max"] + g["b"] for g in generators)

    for _ in range(200):
        lam = (lambda_lo + lambda_hi) / 2.0
        dispatch = []
        for g in generators:
            p = (lam - g["b"]) / (2 * g["a"])
            p = max(g["min"], min(g["max"], p))  # MUST clamp to limits
            dispatch.append(p)
        total = sum(dispatch)
        if abs(total - total_demand) < 1e-6:
            break
        if total < total_demand:
            lambda_lo = lam
        else:
            lambda_hi = lam
    return dispatch, lam

# Read input
with open("generators.json") as f:
    data = json.load(f)
gens = data["generators"]
demand = data["total_demand"]

dispatch, lam = economic_dispatch(gens, demand)

# Build output — verify each generator is within [min, max]
result = []
total_cost = 0.0
for i, p in enumerate(dispatch):
    g = gens[i]
    p = max(g["min"], min(g["max"], p))  # final clamp
    cost = g["a"] * p**2 + g["b"] * p + g["c"]
    result.append({"id": g["id"], "power": round(p, 2), "cost": round(cost, 2)})
    total_cost += cost

with open("dispatch.json", "w") as f:
    json.dump({
        "dispatch": result,
        "total_cost": round(total_cost, 2),
        "lambda": round(lam, 4)
    }, f, indent=2)
```

### Output: `dispatch.json`

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

- `dispatch`: array with **one entry per generator**, each having `id` (int), `power` (MW, float), `cost` (USD, float)
- `total_cost`: sum of individual costs
- `lambda`: the system marginal cost at optimum (positive number)
- Every generator's `power` MUST be >= its `min` and <= its `max`

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Using MW directly in B*theta=P when reactances are per-unit | Divide MW by BASE_MVA (100) before solving, multiply flows back |
| Bus angles too large (> 1 rad) | Always use per-unit power; angles should be 0.01-0.3 rad typically |
| Generator power outside [min, max] | Clamp AFTER lambda iteration AND before writing output |
| Wrong cost formula | Cost = a*P^2 + b*P + c, marginal = 2*a*P + b |
| Forgetting slack bus | theta[0] = 0; slack_gen = total_load - sum(other_gen) |
