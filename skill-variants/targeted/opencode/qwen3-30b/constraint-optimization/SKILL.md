---
name: constraint-optimization
description: Solve combinatorial and constraint optimization problems by writing and running Python scripts. Use when placing items on grids, solving knapsack problems, scheduling with constraints, or optimizing configurations subject to rules.
---

# Constraint Optimization

## CRITICAL RULES

1. **NEVER delegate to subagents/tasks.** Solve the problem yourself by writing a Python script and running it with `python3`.
2. **Always write a Python script** that reads the input JSON, computes the solution, and writes the output JSON. Never try to solve optimization problems in your head.
3. **Validate JSON output** — every JSON file must have matching braces. After writing, read the file back to verify.

## How to Solve Any Constraint Optimization Problem

### Step 1: Read the input file
Use the read tool to see the input data.

### Step 2: Write a Python solver script
Write a `.py` file that:
- Reads the input JSON with `json.load()`
- Implements the algorithm (see templates below)
- Writes the result JSON with `json.dump()` using `indent=2`
- Prints key results so you can verify

### Step 3: Run the script
Execute with `python3 solver.py` and check the output.

### Step 4: Verify the output file
Read the output JSON file to confirm it's valid and correct.

## Template: 0/1 Knapsack (Dynamic Programming)

```python
import json

with open("items.json") as f:
    data = json.load(f)

items = data["items"]
capacity = data["capacity"]
n = len(items)

dp = [[0] * (capacity + 1) for _ in range(n + 1)]
for i in range(1, n + 1):
    w = items[i-1]["weight"]
    v = items[i-1]["value"]
    for c in range(capacity + 1):
        if w > c:
            dp[i][c] = dp[i-1][c]
        else:
            dp[i][c] = max(dp[i-1][c], dp[i-1][c - w] + v)

selected = []
c = capacity
for i in range(n, 0, -1):
    if dp[i][c] != dp[i-1][c]:
        selected.append(items[i-1]["id"])
        c -= items[i-1]["weight"]

selected.sort()
total_weight = sum(it["weight"] for it in items if it["id"] in selected)
total_value = sum(it["value"] for it in items if it["id"] in selected)
vpw = round(total_value / total_weight, 2)

result = {
    "selected_items": selected,
    "total_weight": total_weight,
    "total_value": total_value,
    "value_per_weight": vpw
}

with open("knapsack_result.json", "w") as f:
    json.dump(result, f, indent=2)

print(f"Selected: {selected}")
print(f"Weight: {total_weight}, Value: {total_value}, V/W: {vpw}")
```

## Template: Facility Placement (Greedy + Local Search)

```python
import json
from itertools import combinations

with open("grid.json") as f:
    data = json.load(f)

G = data["grid_size"]
pop = data["population"]
blocked = set(tuple(c) for c in data["blocked_cells"])
radius = data["coverage_radius"]
min_dist = data["min_distance"]
num = data["num_facilities"]

def manhattan(a, b):
    return abs(a[0]-b[0]) + abs(a[1]-b[1])

def covered_pop(facilities):
    total = 0
    cmap = [[0]*G for _ in range(G)]
    for r in range(G):
        for c in range(G):
            for f in facilities:
                if manhattan((r,c), f) <= radius:
                    cmap[r][c] = 1
                    total += pop[r][c]
                    break
    return total, cmap

def valid(facilities):
    for i in range(len(facilities)):
        for j in range(i+1, len(facilities)):
            if manhattan(facilities[i], facilities[j]) < min_dist:
                return False
    return True

candidates = [(r,c) for r in range(G) for c in range(G) if (r,c) not in blocked]

# Greedy construction
chosen = []
remaining = list(candidates)
for _ in range(num):
    best_gain = -1
    best_cell = None
    for cell in remaining:
        trial = chosen + [cell]
        if valid(trial):
            gain, _ = covered_pop(trial)
            if gain > best_gain:
                best_gain = gain
                best_cell = cell
    if best_cell:
        chosen.append(best_cell)
        remaining.remove(best_cell)

# Local search: try swapping each chosen with each unchosen
improved = True
while improved:
    improved = False
    current_score, _ = covered_pop(chosen)
    for i in range(len(chosen)):
        for cell in candidates:
            if cell in chosen:
                continue
            trial = chosen[:i] + [cell] + chosen[i+1:]
            if valid(trial):
                score, _ = covered_pop(trial)
                if score > current_score:
                    chosen = trial
                    current_score = score
                    improved = True
                    break
        if improved:
            break

total, cmap = covered_pop(chosen)
result = {
    "facilities": [list(f) for f in chosen],
    "total_covered_population": total,
    "coverage_map": cmap
}

with open("placement.json", "w") as f:
    json.dump(result, f, indent=2)

print(f"Facilities: {chosen}")
print(f"Covered population: {total}")
```

## Common Pitfalls to Avoid

- **Never solve optimization in your head** — always write and run a script
- **Never delegate to a subagent/task** — do it yourself
- **Always use `json.dump()`** to write JSON — never construct JSON strings manually
- **Manhattan distance**: `|r1-r2| + |c1-c2|`
- **Coverage**: count each cell only once even if multiple facilities cover it
