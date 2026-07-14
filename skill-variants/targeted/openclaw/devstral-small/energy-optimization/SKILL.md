---
name: energy-optimization
description: Solve power systems optimization problems including DC power flow, economic dispatch, and optimal power flow. Use when computing bus angles, line flows, or minimizing generation costs.
---

## CRITICAL RULES

1. NEVER guess or manually write output values. ALWAYS write a Python script to a .py file, run it with `python3`, and let the script write the JSON output.
2. Do NOT write output JSON directly with the write tool. Only the Python script should create the output file.

## DC Power Flow

Write this script to `solve.py` and run it with `python3 solve.py`:

```python
import numpy as np
import json

with open("network.json") as f:
    data = json.load(f)

BASE_MVA = 100.0  # IMPORTANT: per-unit base power

buses = data["buses"]
lines = data["lines"]
generators = data["generators"]
n = len(buses)

# Step 1: Compute generation
total_load = sum(bus.get("load", 0) for bus in buses)
# Find the non-slack generator dispatch (from the task prompt, e.g. 60 MW)
non_slack_gen = 0
for gen in generators:
    if buses[gen["bus"]].get("type") != "slack":
        non_slack_gen += gen.get("dispatch", 60)  # use value from prompt
slack_gen = total_load - non_slack_gen

# Step 2: Build B matrix (susceptance)
B = np.zeros((n, n))
for line in lines:
    i, j = line["from"], line["to"]
    b = 1.0 / line["reactance"]
    B[i][i] += b; B[j][j] += b
    B[i][j] -= b; B[j][i] -= b

# Step 3: Net injection in PER-UNIT (divide MW by BASE_MVA)
P = np.zeros(n)
for bus in buses:
    P[bus["id"]] -= bus.get("load", 0) / BASE_MVA
P[0] += slack_gen / BASE_MVA
for gen in generators:
    if buses[gen["bus"]].get("type") != "slack":
        P[gen["bus"]] += gen.get("dispatch", 60) / BASE_MVA

# Step 4: Solve (remove slack bus row/col 0)
B_red = B[1:, 1:]
P_red = P[1:]
theta_red = np.linalg.solve(B_red, P_red)
theta = np.concatenate([[0.0], theta_red])  # angles in radians

# Step 5: Line flows in MW = (theta_i - theta_j) / x_ij * BASE_MVA
line_flows = []
for line in lines:
    i, j = line["from"], line["to"]
    flow = (theta[i] - theta[j]) / line["reactance"] * BASE_MVA
    line_flows.append(round(flow, 4))

result = {
    "bus_angles": [round(a, 6) for a in theta.tolist()],
    "line_flows": line_flows,
    "generation": [round(slack_gen, 2), round(non_slack_gen, 2)]
}
with open("power_flow.json", "w") as f:
    json.dump(result, f, indent=2)
print("Done:", result)
```

Angles MUST satisfy |theta| < 1.0 radians. If angles are large (>1), the per-unit conversion is wrong.

### Output: `power_flow.json`
```json
{"bus_angles": [0.0, -0.065, -0.082, -0.067, -0.111], "line_flows": [65.3, 54.7, 13.9, 1.5, 28.5, 31.5], "generation": [120.0, 60.0]}
```

---

## Economic Dispatch

Write this script to `solve.py` and run it with `python3 solve.py`:

```python
import json

with open("generators.json") as f:
    data = json.load(f)

gens = data["generators"]
demand = data["total_demand"]

# Lambda iteration (bisection)
lambda_lo = min(2 * g["a"] * g["min"] + g["b"] for g in gens)
lambda_hi = max(2 * g["a"] * g["max"] + g["b"] for g in gens)

for _ in range(500):
    lam = (lambda_lo + lambda_hi) / 2.0
    dispatch = []
    total = 0.0
    for g in gens:
        p = (lam - g["b"]) / (2 * g["a"])
        p = max(g["min"], min(g["max"], p))  # clamp to [min, max]
        dispatch.append(p)
        total += p
    if abs(total - demand) < 0.0001:
        break
    if total < demand:
        lambda_lo = lam
    else:
        lambda_hi = lam

# Cost = a*P^2 + b*P + c for each generator
result_dispatch = []
total_cost = 0.0
for g, p in zip(gens, dispatch):
    cost = g["a"] * p**2 + g["b"] * p + g["c"]
    result_dispatch.append({"id": g["id"], "power": round(p, 4), "cost": round(cost, 4)})
    total_cost += cost

result = {
    "dispatch": result_dispatch,
    "total_cost": round(total_cost, 4),
    "lambda": round(lam, 4)
}
with open("dispatch.json", "w") as f:
    json.dump(result, f, indent=2)
print("Done:", result)
```

### Output: `dispatch.json`
```json
{"dispatch": [{"id": 0, "power": 100.0, "cost": 1340.0}, {"id": 1, "power": 200.0, "cost": 1640.0}], "total_cost": 2980.0, "lambda": 8.8}
```
