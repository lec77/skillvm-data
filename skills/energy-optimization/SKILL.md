---
name: energy-optimization
description: Solve power systems optimization problems including DC power flow, economic dispatch, and optimal power flow. Use when computing bus angles, line flows, or minimizing generation costs.
---

## When to Use

Use this skill when you need to:
- Compute bus voltage angles and line flows using DC power flow approximation
- Solve economic dispatch to minimize total generation cost subject to power balance
- Apply equal incremental cost (lambda iteration) for optimal generator loading
- Check line flow limits and generator operating constraints

---

## DC Power Flow Approximation

DC power flow linearizes the AC power flow equations by assuming flat voltage profiles and small angle differences. For a transmission line between bus `i` and bus `j` with reactance `x_ij`:

```
P_ij = (theta_i - theta_j) / x_ij
```

Where:
- `P_ij` — real power flow from bus i to bus j (MW)
- `theta_i`, `theta_j` — voltage angles at buses i and j (radians)
- `x_ij` — line reactance (per-unit or ohms, consistent units)

### Reference Bus (Slack Bus)

One bus must be designated the **slack bus** with its angle fixed:

```
theta_slack = 0
```

The slack bus absorbs any generation/load imbalance in the network.

---

## Bus Power Balance

At every non-slack bus, the net injected power equals the sum of outgoing line flows:

```
P_gen_i - P_load_i = sum over j of P_ij
```

For a network with `n` buses (bus 0 = slack), write the power balance for buses 1..n-1 as a linear system `B * theta = P_injected`:

```python
import numpy as np

def dc_power_flow(buses, lines, generators):
    n = len(buses)
    B = np.zeros((n, n))

    for line in lines:
        i, j = line["from"], line["to"]
        b = 1.0 / line["reactance"]   # susceptance
        B[i][i] += b
        B[j][j] += b
        B[i][j] -= b
        B[j][i] -= b

    # Net injection vector (generation minus load)
    P = np.zeros(n)
    for bus in buses:
        P[bus["id"]] -= bus.get("load", 0)
    for gen in generators:
        P[gen["bus"]] += gen.get("dispatch", 0)

    # Remove slack bus row/column (bus 0)
    B_red = B[1:, 1:]
    P_red = P[1:]

    theta_red = np.linalg.solve(B_red, P_red)
    theta = np.concatenate([[0.0], theta_red])
    return theta
```

### Computing Line Flows

```python
def compute_line_flows(lines, theta):
    flows = []
    for line in lines:
        i, j = line["from"], line["to"]
        flow = (theta[i] - theta[j]) / line["reactance"]
        flows.append(flow)
    return flows
```

---

## Line Flow Limits

After computing flows, verify each line is within its thermal limit:

```python
for i, (line, flow) in enumerate(zip(lines, line_flows)):
    if abs(flow) > line["limit"]:
        print(f"Line {i} overloaded: {flow:.1f} MW > {line['limit']} MW limit")
```

A feasible dispatch must satisfy `|P_ij| <= P_max_ij` for all lines.

---

## Economic Dispatch

Economic dispatch minimizes total generation cost subject to power balance and generator limits.

### Quadratic Cost Curve

Each generator `i` has cost:

```
C_i(P_i) = a_i * P_i^2 + b_i * P_i + c_i
```

Marginal (incremental) cost:

```
dC_i/dP_i = 2 * a_i * P_i + b_i
```

### Equal Incremental Cost (Lambda Iteration)

At the optimal dispatch, all **unconstrained** generators operate at the same marginal cost `lambda`:

```
2 * a_i * P_i + b_i = lambda
=> P_i = (lambda - b_i) / (2 * a_i)
```

Generators hitting their `min` or `max` limits are fixed at that limit.

### Lambda Iteration Algorithm

```python
def economic_dispatch(generators, total_demand, tol=1e-4, max_iter=100):
    # Bracket lambda: from min marginal cost to max marginal cost
    lambda_lo = min(2 * g["a"] * g["min"] + g["b"] for g in generators)
    lambda_hi = max(2 * g["a"] * g["max"] + g["b"] for g in generators)

    for _ in range(max_iter):
        lam = (lambda_lo + lambda_hi) / 2.0
        total = 0.0
        dispatch = []
        for g in generators:
            p = (lam - g["b"]) / (2 * g["a"])
            p = max(g["min"], min(g["max"], p))   # enforce limits
            dispatch.append(p)
            total += p

        if abs(total - total_demand) < tol:
            break
        if total < total_demand:
            lambda_lo = lam
        else:
            lambda_hi = lam

    return dispatch, lam
```

### Total Cost Computation

```python
def compute_total_cost(generators, dispatch):
    cost = 0.0
    for g, p in zip(generators, dispatch):
        cost += g["a"] * p**2 + g["b"] * p + g["c"]
    return cost
```

---

## Output Format

### DC Power Flow output (`power_flow.json`)

```json
{
  "bus_angles": [0.0, -0.123, -0.098, 0.045, -0.201],
  "line_flows": [75.4, 44.6, 12.1, 55.3, 30.0, 25.0],
  "generation": [120.0, 60.0]
}
```

### Economic Dispatch output (`dispatch.json`)

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

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Forgetting to fix slack bus angle | Set `theta[slack_bus] = 0` before solving |
| Off-by-one in B-matrix indexing | Rows/columns must match bus IDs exactly |
| Not removing slack row/column | The reduced B matrix must exclude the slack bus |
| Sign error in flow direction | `P_ij = (theta_i - theta_j) / x_ij`; positive = from i to j |
| Lambda search bracket too narrow | Initialize from min/max marginal costs across all generators |
| Forgetting generator limits in dispatch | Always clamp `P_i` to `[min, max]` before summing |
| Wrong cost formula | Cost is `a*P^2 + b*P + c`, marginal cost is `2*a*P + b` |
