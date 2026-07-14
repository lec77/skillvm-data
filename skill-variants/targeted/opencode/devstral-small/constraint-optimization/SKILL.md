---
name: constraint-optimization
description: Solve combinatorial and constraint optimization problems by writing and running Python scripts. Use when placing items on grids, solving knapsack problems, scheduling with constraints, or optimizing configurations subject to rules.
---

# Constraint Optimization

## CRITICAL RULES — READ FIRST

1. **NEVER use the Task tool or delegate to subagents.** You MUST solve the problem yourself.
2. **ALWAYS write a Python script** to a `.py` file, then run it with `python3`. NEVER try to compute optimization solutions in your head — you WILL make mistakes.
3. **Use `json.dump()` to write JSON output** — never construct JSON strings manually.
4. **After running the script**, read the output file to verify it is valid JSON with correct values.

## How to Solve

1. **Read** the input JSON file to understand the problem
2. **Write** a Python solver script (`solve.py`) that reads input, computes the solution, writes output JSON
3. **Run** the script: `python3 solve.py`
4. **Verify** by reading the output file

## 0/1 Knapsack — Use Dynamic Programming

Each item taken at most once. Greedy by value/weight ratio is NOT optimal. Always use DP.

Write this script to `solve.py` and run it:

```python
import json

with open("items.json") as f:
    data = json.load(f)

items = data["items"]
capacity = data["capacity"]
n = len(items)

# DP table
dp = [[0] * (capacity + 1) for _ in range(n + 1)]
for i in range(1, n + 1):
    w = items[i-1]["weight"]
    v = items[i-1]["value"]
    for c in range(capacity + 1):
        if w > c:
            dp[i][c] = dp[i-1][c]
        else:
            dp[i][c] = max(dp[i-1][c], dp[i-1][c - w] + v)

# Traceback to find selected items
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

## Facility Placement — Greedy Marginal Gain + Local Search

Place k facilities on a grid to maximize covered population. Constraints: blocked cells, minimum Manhattan distance between facilities, coverage radius.

Write this script to `solve.py` and run it:

```python
import json

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

def get_covered_cells(facilities):
    covered = set()
    for r in range(G):
        for c in range(G):
            for f in facilities:
                if manhattan((r,c), f) <= radius:
                    covered.add((r,c))
                    break
    return covered

def total_pop(covered):
    return sum(pop[r][c] for r, c in covered)

def is_valid(facilities):
    for i in range(len(facilities)):
        for j in range(i+1, len(facilities)):
            if manhattan(facilities[i], facilities[j]) < min_dist:
                return False
    return True

valid_cells = [(r,c) for r in range(G) for c in range(G) if (r,c) not in blocked]

# Greedy: pick facility with max marginal population gain
chosen = []
covered = set()
for _ in range(num):
    best_cell = None
    best_gain = -1
    candidates = [v for v in valid_cells if v not in chosen
                  and all(manhattan(v, f) >= min_dist for f in chosen)]
    for cand in candidates:
        new_cells = get_covered_cells([cand])
        gain = sum(pop[r][c] for r, c in new_cells if (r, c) not in covered)
        if gain > best_gain:
            best_gain = gain
            best_cell = cand
    if best_cell is None:
        break
    chosen.append(best_cell)
    covered |= get_covered_cells([best_cell])

# Local search: try swapping each chosen with each unchosen
improved = True
while improved:
    improved = False
    current_pop = total_pop(covered)
    for i in range(len(chosen)):
        for cand in valid_cells:
            if cand in chosen:
                continue
            trial = chosen[:i] + [cand] + chosen[i+1:]
            if not is_valid(trial):
                continue
            trial_covered = get_covered_cells(trial)
            trial_pop = total_pop(trial_covered)
            if trial_pop > current_pop:
                chosen = trial
                covered = trial_covered
                current_pop = trial_pop
                improved = True
                break
        if improved:
            break

# Build output
cov_map = [[0]*G for _ in range(G)]
for r, c in covered:
    cov_map[r][c] = 1

result = {
    "facilities": [list(f) for f in chosen],
    "total_covered_population": total_pop(covered),
    "coverage_map": cov_map
}

with open("placement.json", "w") as f:
    json.dump(result, f, indent=2)

print(f"Facilities: {chosen}")
print(f"Covered population: {total_pop(covered)}")
```

## Common Pitfalls

- **NEVER delegate to a subagent/task** — do it yourself
- **NEVER solve optimization in your head** — always write and run a Python script
- **Manhattan distance**: `|r1-r2| + |c1-c2|`
- **Coverage**: count each cell only once even if multiple facilities cover it (use a set)
- **Greedy ratio is NOT optimal for 0/1 knapsack** — always use DP
