---
name: energy-optimization
description: Solve power systems optimization problems including DC power flow, economic dispatch, and optimal power flow. Use when computing bus angles, line flows, or minimizing generation costs.
---

# DC Power Flow

Compute bus voltage angles and line flows for a DC power network.

## CRITICAL: Per-Unit Conversion

Network reactances are in per-unit. Power values in the JSON are in MW. You MUST convert to per-unit before solving:
- S_base = 100 MVA
- P_pu = P_MW / S_base
- Solve B * theta = P_pu (angles will be small, typically |theta| < 0.5 rad)
- Convert flows back: flow_MW = (theta_i - theta_j) / x_ij * S_base

If you skip this conversion, angles will be ~100x too large and fail validation.

## CRITICAL: Setting Generation

The network.json does NOT contain generation dispatch values. Read the task prompt for generation amounts. Example: "generator at bus 3 produces 60 MW" means you set gen_dispatch = {3: 60}. The slack bus (bus 0) picks up the remainder: slack_gen = total_load - sum(other gen).

## Complete Python Solution

Save this as a .py file and run with `python3 <filename>.py`. The script writes the output file directly.

```python
import numpy as np
import json

with open("network.json") as f:
    data = json.load(f)

buses = data["buses"]
lines = data["lines"]
generators = data["generators"]
n = len(buses)
S_base = 100.0  # MVA base for per-unit conversion

# SET GENERATION FROM PROMPT (example: bus 3 = 60 MW)
gen_dispatch = {3: 60}  # <-- CHANGE THIS based on task prompt

# Slack bus picks up remainder
total_load = sum(bus.get("load", 0) for bus in buses)
slack_gen = total_load - sum(gen_dispatch.values())
gen_dispatch[0] = slack_gen

# Build B matrix (susceptance)
B = np.zeros((n, n))
for line in lines:
    i, j = line["from"], line["to"]
    b = 1.0 / line["reactance"]
    B[i][i] += b; B[j][j] += b
    B[i][j] -= b; B[j][i] -= b

# Injection vector in PER-UNIT
P = np.zeros(n)
for bus in buses:
    P[bus["id"]] -= bus.get("load", 0) / S_base
for bus_id, power in gen_dispatch.items():
    P[bus_id] += power / S_base

# Remove slack bus (row/col 0), solve
B_red = B[1:, 1:]
P_red = P[1:]
theta_red = np.linalg.solve(B_red, P_red)
theta = np.concatenate([[0.0], theta_red])

# Line flows in MW
line_flows = []
for line in lines:
    i, j = line["from"], line["to"]
    flow = (theta[i] - theta[j]) / line["reactance"] * S_base
    line_flows.append(float(flow))

# Generation array
generation = [slack_gen]
for gen in generators:
    if gen["bus"] != 0:
        generation.append(gen_dispatch.get(gen["bus"], 0))

result = {
    "bus_angles": [round(float(a), 6) for a in theta],
    "line_flows": [round(float(f), 4) for f in line_flows],
    "generation": [round(float(g), 2) for g in generation]
}
with open("power_flow.json", "w") as f:
    json.dump(result, f, indent=2)
print(json.dumps(result, indent=2))
```

## Output: power_flow.json

```json
{
  "bus_angles": [0.0, -0.065, -0.082, 0.01, -0.12],
  "line_flows": [65.0, 54.7, -12.1, 55.3, 30.0, 25.0],
  "generation": [120.0, 60.0]
}
```

---

# Economic Dispatch

Minimize total generation cost to meet demand using equal incremental cost (lambda iteration).

## Method

- Cost: C_i(P) = a*P² + b*P + c
- Marginal cost: dC/dP = 2*a*P + b
- At optimum: P_i = (lambda - b_i)/(2*a_i), clamped to [min, max]
- Binary search lambda until sum(P_i) = total_demand

## Step-by-Step Instructions

1. Read generators.json to get generator parameters and total_demand
2. Compute the dispatch using the Python code below — save as .py file and run with `python3`
3. After running, verify the printed output shows all generators within their [min, max] limits
4. Then use the `write` tool to save `dispatch.json` with the EXACT JSON that was printed

## Python Code

```python
import json

with open("generators.json") as f:
    data = json.load(f)

gens = data["generators"]
demand = data["total_demand"]

# Lambda iteration (bisection)
lo = min(2.0 * g["a"] * g["min"] + g["b"] for g in gens)
hi = max(2.0 * g["a"] * g["max"] + g["b"] for g in gens)

for _ in range(2000):
    lam = (lo + hi) / 2.0
    powers = []
    for g in gens:
        p = (lam - g["b"]) / (2.0 * g["a"])
        if p < g["min"]: p = float(g["min"])
        if p > g["max"]: p = float(g["max"])
        powers.append(p)
    total = sum(powers)
    if abs(total - demand) < 1e-10:
        break
    if total < demand:
        lo = lam
    else:
        hi = lam

# Build result
dispatch_list = []
total_cost = 0.0
for g, p in zip(gens, powers):
    c = g["a"] * p * p + g["b"] * p + g["c"]
    total_cost += c
    dispatch_list.append({"id": g["id"], "power": round(p, 2), "cost": round(c, 2)})

output = {
    "dispatch": dispatch_list,
    "total_cost": round(total_cost, 2),
    "lambda": round(lam, 4)
}
print(json.dumps(output, indent=2))
```

After running the script, copy the EXACT printed JSON and use the `write` tool to save it as `dispatch.json`.

## Output Format: dispatch.json

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

## Rules

- Every generator's power MUST be within its [min, max] limits
- total_cost = sum of all individual costs
- sum of all dispatch powers = total_demand exactly
- lambda must be a positive number
- Always use `python3` (not `python`) for execution
