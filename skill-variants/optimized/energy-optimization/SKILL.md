---
name: energy-optimization
description: Solve power systems optimization: DC power flow (bus angles, line flows) and economic dispatch (minimize generation cost via equal incremental cost method).
---

## DC Power Flow

Linearized AC power flow. Line flow: `P_ij = (theta_i - theta_j) / x_ij`. Slack bus (bus 0): `theta_0 = 0`.

Build susceptance matrix B, solve reduced system for angles:

```python
import numpy as np

def dc_power_flow(buses, lines, generators):
    n = len(buses)
    B = np.zeros((n, n))
    for line in lines:
        i, j = line["from"], line["to"]
        b = 1.0 / line["reactance"]
        B[i][i] += b; B[j][j] += b
        B[i][j] -= b; B[j][i] -= b

    P = np.zeros(n)
    for bus in buses:
        P[bus["id"]] -= bus.get("load", 0)
    for gen in generators:
        P[gen["bus"]] += gen.get("dispatch", 0)

    # Remove slack bus (bus 0) row/col — MUST do this
    B_red = B[1:, 1:]
    P_red = P[1:]
    theta_red = np.linalg.solve(B_red, P_red)
    theta = np.concatenate([[0.0], theta_red])
    return theta

def compute_line_flows(lines, theta):
    return [(theta[l["from"]] - theta[l["to"]]) / l["reactance"] for l in lines]
```

**Validation**: All `|P_ij| <= limit`. Angles are in radians and must be small (all |theta| < 1.0 rad for typical networks). Verify this in output.

### Output (`power_flow.json`)

```json
{
  "bus_angles": [0.0, -0.123, -0.098, 0.045, -0.201],
  "line_flows": [75.4, 44.6, 12.1, 55.3, 30.0, 25.0],
  "generation": [120.0, 60.0]
}
```

## Economic Dispatch

Minimize total cost subject to power balance and generator limits.

Cost: `C_i(P) = a*P^2 + b*P + c`. Marginal cost: `dC/dP = 2*a*P + b`.

At optimum, all unconstrained generators have equal marginal cost λ: `P_i = (λ - b_i) / (2*a_i)`, then clamp: `P_i = max(min_i, min(max_i, P_i))`. Verify every generator satisfies `min <= power <= max` in the output.

```python
def economic_dispatch(generators, total_demand, tol=1e-4, max_iter=100):
    lambda_lo = min(2*g["a"]*g["min"] + g["b"] for g in generators)
    lambda_hi = max(2*g["a"]*g["max"] + g["b"] for g in generators)
    for _ in range(max_iter):
        lam = (lambda_lo + lambda_hi) / 2.0
        dispatch = []
        total = 0.0
        for g in generators:
            p = (lam - g["b"]) / (2 * g["a"])
            p = max(g["min"], min(g["max"], p))  # always clamp to limits
            dispatch.append(p)
            total += p
        if abs(total - total_demand) < tol:
            break
        if total < total_demand:
            lambda_lo = lam
        else:
            lambda_hi = lam
    return dispatch, lam

def compute_total_cost(generators, dispatch):
    return sum(g["a"]*p**2 + g["b"]*p + g["c"] for g, p in zip(generators, dispatch))
```

### Output (`dispatch.json`)

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
