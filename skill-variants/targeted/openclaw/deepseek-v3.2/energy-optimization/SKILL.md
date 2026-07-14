---
name: energy-optimization
description: Solve power systems optimization problems including DC power flow, economic dispatch, and optimal power flow. Use when computing bus angles, line flows, or minimizing generation costs.
---

# Energy Optimization

## Step-by-step Instructions

### For Economic Dispatch tasks

1. Read the input JSON file (e.g., `generators.json`)
2. Write a Python script to a file, then run it with python3
3. The script produces `dispatch.json`

**Write this script to a .py file and run it:**

```python
import json

with open("generators.json") as f:
    data = json.load(f)

generators = data["generators"]
total_demand = data["total_demand"]

# Lambda iteration (bisection on marginal cost)
lambda_lo = min(2*g["a"]*g["min"] + g["b"] for g in generators)
lambda_hi = max(2*g["a"]*g["max"] + g["b"] for g in generators)

for _ in range(1000):
    lam = (lambda_lo + lambda_hi) / 2.0
    dispatch_powers = []
    for g in generators:
        p = (lam - g["b"]) / (2 * g["a"])
        p = max(g["min"], min(g["max"], p))
        dispatch_powers.append(p)
    total = sum(dispatch_powers)
    if abs(total - total_demand) < 1e-6:
        break
    if total < total_demand:
        lambda_lo = lam
    else:
        lambda_hi = lam

dispatch_list = []
total_cost = 0.0
for i, (g, p) in enumerate(zip(generators, dispatch_powers)):
    cost = g["a"] * p**2 + g["b"] * p + g["c"]
    dispatch_list.append({"id": i, "power": round(p, 4), "cost": round(cost, 4)})
    total_cost += cost

result = {
    "dispatch": dispatch_list,
    "total_cost": round(total_cost, 4),
    "lambda": round(lam, 4)
}

with open("dispatch.json", "w") as f:
    json.dump(result, f, indent=2)
print("Done")
```

### For DC Power Flow tasks

1. Read the input JSON (e.g., `network.json`)
2. Identify generator dispatch values from the task description
3. Write a Python script to a file, then run it with python3
4. The script produces `power_flow.json`

**CRITICAL RULES:**
- Reactances are per-unit on 100 MVA base. Convert all MW values to per-unit by dividing by 100 before solving. Convert flows back to MW by multiplying by 100.
- This keeps bus angles small (well under 1.0 radian).
- Slack bus (bus 0) angle = 0 always.
- Set each generator's dispatch MW as given in the task prompt.

**Write this script to a .py file. Replace DISPATCH_VALUES with actual MW values from the task:**

```python
import json
import numpy as np

with open("network.json") as f:
    data = json.load(f)

buses = data["buses"]
lines = data["lines"]
generators = data["generators"]
n = len(buses)
baseMVA = 100.0

# SET DISPATCH VALUES HERE (from task prompt, in MW)
# Example: {bus_id: mw_value} for each non-slack generator
gen_dispatch = {}  # e.g., {3: 60} means bus 3 produces 60 MW
# FILL IN gen_dispatch FROM THE TASK PROMPT

# Build B matrix
B = np.zeros((n, n))
for line in lines:
    i, j = line["from"], line["to"]
    b = 1.0 / line["reactance"]
    B[i][i] += b
    B[j][j] += b
    B[i][j] -= b
    B[j][i] -= b

# Net injection in per-unit
P = np.zeros(n)
for bus in buses:
    P[bus["id"]] -= bus.get("load", 0) / baseMVA
for bus_id, mw in gen_dispatch.items():
    P[bus_id] += mw / baseMVA

# Remove slack bus (bus 0) row/column
B_red = B[1:, 1:]
P_red = P[1:]
theta_red = np.linalg.solve(B_red, P_red)
theta = np.concatenate([[0.0], theta_red])

# Line flows in MW
line_flows = []
for line in lines:
    i, j = line["from"], line["to"]
    flow = (theta[i] - theta[j]) / line["reactance"] * baseMVA
    line_flows.append(round(float(flow), 6))

# Generation values
total_load = sum(bus.get("load", 0) for bus in buses)
non_slack_gen = sum(gen_dispatch.values())
slack_gen = total_load - non_slack_gen
gen_output = [round(float(slack_gen), 4)] + [round(float(gen_dispatch[g["bus"]]), 4) for g in generators if g["bus"] in gen_dispatch]

result = {
    "bus_angles": [round(float(a), 6) for a in theta],
    "line_flows": line_flows,
    "generation": gen_output
}

with open("power_flow.json", "w") as f:
    json.dump(result, f, indent=2)
print("Done")
```

## Key Formulas

- **Line flow**: `P_ij = (theta_i - theta_j) / x_ij` (per-unit; multiply by baseMVA for MW)
- **Cost**: `C(P) = a*P^2 + b*P + c`
- **Marginal cost**: `dC/dP = 2*a*P + b`
- **Optimal dispatch**: `P_i = (lambda - b_i) / (2*a_i)`, clamped to `[min, max]`
- **Slack bus angle**: always 0 radians
- **baseMVA**: always 100
