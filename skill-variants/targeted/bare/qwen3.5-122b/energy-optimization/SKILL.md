---
name: energy-optimization
description: Solve power systems optimization problems including DC power flow, economic dispatch, and optimal power flow. Use when computing bus angles, line flows, or minimizing generation costs.
---

## When to Use

- Compute bus voltage angles and line flows using DC power flow approximation
- Solve economic dispatch to minimize total generation cost
- Apply equal incremental cost (lambda iteration) for optimal generator loading

---

## DC Power Flow

### Core Equation

```
P_ij = (theta_i - theta_j) / x_ij
```

**CRITICAL: Per-Unit Conversion.** If loads are in MW and reactances are in per-unit, you MUST convert power to per-unit before solving. Use base power Sbase = 100 MVA:

```
P_pu = P_MW / 100
```

Solve for angles in per-unit system, then compute flows and convert back to MW:

```
flow_MW = (theta_i - theta_j) / x_ij * Sbase
```

Expected angle magnitudes: **all |theta| < 0.5 radians** typically. If you get angles > 1.0 radian, you almost certainly forgot per-unit conversion.

### Slack Bus

One bus (usually bus 0) has angle fixed at 0. It absorbs generation/load imbalance:
```
theta_slack = 0
slack_generation = total_load - sum(other_generation)
```

### Solution Algorithm

```python
import numpy as np
import json

def solve_dc_power_flow(buses, lines, gen_dispatch):
    """
    buses: list of {id, type, load}
    lines: list of {from, to, reactance, limit}
    gen_dispatch: dict mapping bus_id -> MW output (excluding slack)
    Returns: theta (radians), line_flows (MW), slack_gen (MW)
    """
    n = len(buses)
    Sbase = 100.0  # MVA base for per-unit conversion

    # Build susceptance matrix
    B = np.zeros((n, n))
    for line in lines:
        i, j = line["from"], line["to"]
        b = 1.0 / line["reactance"]
        B[i, i] += b
        B[j, j] += b
        B[i, j] -= b
        B[j, i] -= b

    # Net injection in per-unit (generation - load) / Sbase
    P = np.zeros(n)
    for bus in buses:
        P[bus["id"]] -= bus.get("load", 0) / Sbase
    for bus_id, gen_mw in gen_dispatch.items():
        P[bus_id] += gen_mw / Sbase

    # Remove slack bus (bus 0) row/column
    B_red = B[1:, 1:]
    P_red = P[1:]

    # Solve linear system
    theta_red = np.linalg.solve(B_red, P_red)
    theta = np.concatenate([[0.0], theta_red])

    # Compute line flows in MW
    line_flows = []
    for line in lines:
        i, j = line["from"], line["to"]
        flow = (theta[i] - theta[j]) / line["reactance"] * Sbase
        line_flows.append(flow)

    # Slack bus generation
    total_load = sum(bus.get("load", 0) for bus in buses)
    other_gen = sum(gen_dispatch.values())
    slack_gen = total_load - other_gen

    return theta, line_flows, slack_gen
```

### Verification Checklist

After solving, verify:
1. `theta[0] == 0` (slack bus angle)
2. All `|theta[i]| < 1.0` radians — if not, check per-unit conversion
3. `sum(generation) == sum(loads)` (power balance)
4. All `|flow[i]| <= limit[i]` (line limits)

### Output Format (`power_flow.json`)

```json
{
  "bus_angles": [0.0, -0.0653, -0.0820, -0.0665, -0.1105],
  "line_flows": [65.3, 54.7, 13.9, 1.5, 28.5, 31.5],
  "generation": [120.0, 60.0]
}
```

---

## Economic Dispatch

Minimize total cost subject to power balance and generator limits.

### Cost Curve

```
C_i(P_i) = a_i * P_i^2 + b_i * P_i + c_i
Marginal cost: dC_i/dP_i = 2 * a_i * P_i + b_i
```

### Equal Incremental Cost (Lambda Iteration)

At optimum, unconstrained generators have equal marginal cost lambda:
```
P_i = (lambda - b_i) / (2 * a_i)
```
Generators at limits are clamped to min or max.

### Complete Algorithm (use this exactly)

```python
import json

def economic_dispatch(generators, total_demand):
    # Bracket lambda using marginal costs at min/max
    lambda_lo = min(2*g["a"]*g["min"] + g["b"] for g in generators)
    lambda_hi = max(2*g["a"]*g["max"] + g["b"] for g in generators)

    for _ in range(500):
        lam = (lambda_lo + lambda_hi) / 2.0
        dispatch = []
        for g in generators:
            p = (lam - g["b"]) / (2 * g["a"])
            p = max(float(g["min"]), min(float(g["max"]), p))  # clamp to limits
            dispatch.append(p)
        total = sum(dispatch)
        if abs(total - total_demand) < 1e-8:
            break
        if total < total_demand:
            lambda_lo = lam
        else:
            lambda_hi = lam
    return dispatch, lam

# After solving, round and RECOMPUTE:
dispatch_powers, lam = economic_dispatch(generators, total_demand)

# Round powers to 4 decimal places, then re-clamp to ensure within limits
results = []
total_cost = 0.0
for g, p in zip(generators, dispatch_powers):
    p = round(p, 4)
    p = max(float(g["min"]), min(float(g["max"]), p))  # re-clamp after rounding
    cost = g["a"] * p**2 + g["b"] * p + g["c"]
    total_cost += cost
    results.append({"id": g["id"], "power": float(p), "cost": float(cost)})

output = {
    "dispatch": results,
    "total_cost": float(total_cost),
    "lambda": float(lam)
}
with open("dispatch.json", "w") as f:
    json.dump(output, f, indent=2)
```

**IMPORTANT**: Always use `float()` on all numeric values in JSON output. Always re-clamp power values to `[min, max]` after any rounding. Verify `sum(powers) ≈ demand` and each `min <= power <= max`.

### Output Format (`dispatch.json`)

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

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Angles too large (>1 rad) | Convert MW to per-unit: divide by Sbase=100 |
| Forgetting slack bus angle=0 | Set theta[0]=0 before solving |
| Not removing slack row/column | Reduced B matrix excludes bus 0 |
| Sign error in flow | P_ij = (theta_i - theta_j) / x_ij; positive = from→to |
| Lambda bracket too narrow | Use min/max marginal costs across all generators |
| Generator over/under limits | Always clamp P to [min, max] after computing |
| Wrong cost formula | Cost = a*P^2 + b*P + c, marginal = 2*a*P + b |
| Flows not in MW | Multiply per-unit flow by Sbase to get MW |
