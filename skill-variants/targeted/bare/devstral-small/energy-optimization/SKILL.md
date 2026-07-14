---
name: energy-optimization
description: Solve power systems optimization problems including DC power flow and economic dispatch. ALWAYS write and execute a Python script - never compute mentally.
---

## CRITICAL RULES

1. ALWAYS write a Python script to solve the problem, then execute it with `execute_command`. NEVER try to compute answers mentally.
2. When using `write_file`, the `content` parameter MUST be a string, not a JSON object.
3. Read input files first to understand the data structure.
4. After running the script, verify the output looks correct before finishing.

---

## Economic Dispatch

Minimize total generation cost meeting demand. Each generator has cost C(P) = a*P² + b*P + c.

### Complete Python Script — copy this exactly, adapt filenames only

```python
import json

with open("generators.json") as f:
    data = json.load(f)

generators = data["generators"]
total_demand = data["total_demand"]

# Lambda iteration (bisection on marginal cost)
# Marginal cost: dC/dP = 2*a*P + b
# At optimum: P = (lambda - b) / (2*a), clamped to [min, max]

lambda_lo = min(2*g["a"]*g["min"] + g["b"] for g in generators)
lambda_hi = max(2*g["a"]*g["max"] + g["b"] for g in generators)

for _ in range(500):
    lam = (lambda_lo + lambda_hi) / 2.0
    dispatch = []
    total = 0.0
    for g in generators:
        p = (lam - g["b"]) / (2 * g["a"])
        p = max(g["min"], min(g["max"], p))  # MUST clamp to [min, max]
        dispatch.append(p)
        total += p
    if abs(total - total_demand) < 0.0001:
        break
    if total < total_demand:
        lambda_lo = lam
    else:
        lambda_hi = lam

# Verify all generators are within limits
for g, p in zip(generators, dispatch):
    assert g["min"] <= p <= g["max"], f"Generator {g['id']} out of limits: {p}"
assert abs(sum(dispatch) - total_demand) < 0.1, f"Power balance violated: {sum(dispatch)} != {total_demand}"

# Build output
result = {"dispatch": [], "total_cost": 0.0, "lambda": round(lam, 6)}
for g, p in zip(generators, dispatch):
    cost = g["a"] * p**2 + g["b"] * p + g["c"]
    result["dispatch"].append({"id": g["id"], "power": round(p, 4), "cost": round(cost, 4)})
    result["total_cost"] += cost
result["total_cost"] = round(result["total_cost"], 4)

with open("dispatch.json", "w") as f:
    json.dump(result, f, indent=2)
print("Written dispatch.json")
print(json.dumps(result, indent=2))
```

### Output format (`dispatch.json`)

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

## DC Power Flow

Compute bus voltage angles and line flows for a DC power system.

### IMPORTANT: Per-unit conversion

The reactances in network.json are in per-unit. Power values (loads, generation) are in MW. You MUST convert power to per-unit before solving by dividing by S_base=100, then convert line flows back to MW by multiplying by S_base=100. Without this, angles will be 100x too large.

### IMPORTANT: Setting generator output

The task prompt specifies generator outputs (e.g., "generator at bus 3 produces 60 MW"). You must manually set these values in the injection vector P. The generators in network.json do NOT have a "dispatch" field — you must add the generation value yourself based on the prompt.

### Complete Python Script — copy this exactly, adapt generator values from prompt

```python
import json
import numpy as np

with open("network.json") as f:
    data = json.load(f)

buses = data["buses"]
lines = data["lines"]
generators = data["generators"]
n = len(buses)
S_base = 100.0  # MVA base for per-unit conversion

# Build B matrix (susceptance matrix)
B = np.zeros((n, n))
for line in lines:
    i, j = line["from"], line["to"]
    b = 1.0 / line["reactance"]
    B[i][i] += b
    B[j][j] += b
    B[i][j] -= b
    B[j][i] -= b

# Net injection vector in per-unit
# P[i] = (generation_i - load_i) / S_base
P = np.zeros(n)
for bus in buses:
    P[bus["id"]] -= bus.get("load", 0) / S_base

# === SET NON-SLACK GENERATOR OUTPUT HERE ===
# Read the prompt to find generator outputs.
# Example: "generator at bus 3 produces 60 MW" means add 60/S_base to P[3]
# MODIFY THIS LINE based on the prompt:
P[3] += 60.0 / S_base  # bus 3 generator produces 60 MW

# Slack bus generation = total_load - other_generation (in MW)
total_load = sum(bus.get("load", 0) for bus in buses)
other_gen_mw = 60.0  # MODIFY: sum of all non-slack generation in MW
slack_gen_mw = total_load - other_gen_mw

# Solve reduced system (remove slack bus 0)
B_red = B[1:, 1:]
P_red = P[1:]
theta_red = np.linalg.solve(B_red, P_red)
theta = np.concatenate([[0.0], theta_red])  # slack angle = 0

# Compute line flows in MW
line_flows = []
for line in lines:
    i, j = line["from"], line["to"]
    flow_pu = (theta[i] - theta[j]) / line["reactance"]
    line_flows.append(round(flow_pu * S_base, 4))  # convert to MW

result = {
    "bus_angles": [round(a, 6) for a in theta.tolist()],
    "line_flows": line_flows,
    "generation": [slack_gen_mw, other_gen_mw]
}

with open("power_flow.json", "w") as f:
    json.dump(result, f, indent=2)
print("Written power_flow.json")
print(json.dumps(result, indent=2))
```

### Output format (`power_flow.json`)

```json
{
  "bus_angles": [0.0, -0.065, -0.082, -0.067, -0.110],
  "line_flows": [65.3, 54.7, 13.9, 1.5, 28.5, 31.5],
  "generation": [120.0, 60.0]
}
```

Note: bus_angles should all have |value| < 1.0 radians. If angles are larger than 1.0, you forgot the per-unit conversion (divide power by S_base=100).

---

## Common Mistakes

- NEVER compute results mentally — always write and run a Python script
- write_file content must be a STRING, not a dict/object
- Slack bus generation = total_load - sum(other_gen), NOT other way around
- Always clamp generator power to [min, max] in economic dispatch
- Cost formula: C = a*P² + b*P + c, marginal cost = 2*a*P + b
- DC power flow: divide MW by S_base=100 before solving, multiply flows by S_base after
