---
name: energy-optimization
description: Solve power systems optimization problems including DC power flow and economic dispatch. Provides complete Python scripts to run directly.
---

## IMPORTANT: Reading Files

If `read_file` fails, use `execute_command` with `cat filename.json` to read file contents. Always read input files before computing — never assume or fabricate data.

## DC Power Flow

Given a network JSON file with buses, lines, and generators, compute bus voltage angles and line flows.

**IMPORTANT**: The task prompt tells you which generators produce how much power (e.g. "generator at bus 3 produces 60 MW"). The network.json file may NOT include dispatch values — you must set them in your script based on what the prompt says. The slack bus (bus 0) generation is computed as: total_load minus sum of all other generator outputs.

**Per-unit conversion**: Reactances in network.json are per-unit on a 100 MVA base. Divide MW power injections by 100 before solving, then multiply line flows by 100 to get MW.

**Complete script** — adapt dispatch values from the prompt, save as `solve_pf.py`, run with `python3 solve_pf.py`:

```python
import json
import numpy as np

with open('network.json', 'r') as f:
    data = json.load(f)

buses = data['buses']
lines = data['lines']
generators = data['generators']
n = len(buses)
S_base = 100.0  # MVA base for per-unit conversion

# SET DISPATCH VALUES FROM THE TASK PROMPT (not from JSON)
# Example: if prompt says "generator at bus 3 produces 60 MW"
# then set dispatch for bus 3 = 60
gen_dispatch = {}
for gen in generators:
    gen_dispatch[gen['bus']] = 0
# UPDATE THESE VALUES based on the task prompt:
# gen_dispatch[3] = 60  # <-- set bus and MW from prompt

# Compute slack generation
total_load = sum(bus.get('load', 0) for bus in buses)
non_slack_gen = sum(v for k, v in gen_dispatch.items() if k != 0)
slack_gen = total_load - non_slack_gen
gen_dispatch[0] = slack_gen

# Build susceptance matrix B
B = np.zeros((n, n))
for line in lines:
    i = line['from']
    j = line['to']
    b = 1.0 / line['reactance']
    B[i][i] += b
    B[j][j] += b
    B[i][j] -= b
    B[j][i] -= b

# Net power injection (convert MW to per-unit)
P = np.zeros(n)
for bus in buses:
    P[bus['id']] -= bus.get('load', 0)
for bus_id, mw in gen_dispatch.items():
    P[bus_id] += mw
P = P / S_base  # convert to per-unit

# Remove slack bus (bus 0) and solve for angles
B_red = B[1:, 1:]
P_red = P[1:]
theta_red = np.linalg.solve(B_red, P_red)
theta = np.concatenate([[0.0], theta_red])

# Compute line flows in MW
line_flows = []
for line in lines:
    i = line['from']
    j = line['to']
    flow_pu = (theta[i] - theta[j]) / line['reactance']
    line_flows.append(round(flow_pu * S_base, 6))

# Generation array: [slack_output, other generators]
generation = [slack_gen]
for gen in generators:
    if gen['bus'] != 0:
        generation.append(gen_dispatch[gen['bus']])

result = {
    'bus_angles': [round(float(a), 6) for a in theta],
    'line_flows': line_flows,
    'generation': generation
}

with open('power_flow.json', 'w') as f:
    json.dump(result, f, indent=2)
print('Done. Output written to power_flow.json')
```

**Key rules:**
- Slack bus (bus 0) angle = 0 always
- Angles in radians, all |theta| < 1.0 for typical networks
- Line flows: positive = from-to direction, in MW
- Generation: [slack_output, other_gen_output]

## Economic Dispatch

Given generators with quadratic cost curves, find minimum-cost dispatch meeting total demand.

**Complete script** — save as `solve_ed.py` and run with `python3 solve_ed.py`:

```python
import json

with open('generators.json', 'r') as f:
    data = json.load(f)

generators = data['generators']
total_demand = data['total_demand']

lambda_lo = min(2 * g['a'] * g['min'] + g['b'] for g in generators)
lambda_hi = max(2 * g['a'] * g['max'] + g['b'] for g in generators)

for iteration in range(200):
    lam = (lambda_lo + lambda_hi) / 2.0
    dispatch = []
    total = 0.0
    for g in generators:
        p = (lam - g['b']) / (2 * g['a'])
        p = max(g['min'], min(g['max'], p))
        dispatch.append(p)
        total += p
    if abs(total - total_demand) < 1e-6:
        break
    if total < total_demand:
        lambda_lo = lam
    else:
        lambda_hi = lam

result_dispatch = []
total_cost = 0.0
for g, p in zip(generators, dispatch):
    cost = g['a'] * p * p + g['b'] * p + g['c']
    result_dispatch.append({"id": g['id'], "power": round(p, 4), "cost": round(cost, 4)})
    total_cost += cost

output = {
    "dispatch": result_dispatch,
    "total_cost": round(total_cost, 4),
    "lambda": round(lam, 6)
}

with open('dispatch.json', 'w') as f:
    json.dump(output, f, indent=2)
print('Done. Output written to dispatch.json')
```

**Key rules:**
- Cost: C = a*P^2 + b*P + c
- Marginal cost: dC/dP = 2*a*P + b
- At optimum: unconstrained generators have equal marginal cost lambda
- Always clamp power to [min, max] limits
- Total power must equal total_demand
