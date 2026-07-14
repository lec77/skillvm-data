---
name: constraint-optimization
description: Solve combinatorial and constraint optimization problems using pruning, greedy heuristics, and local search. Use when placing items on grids, scheduling with constraints, solving assignment problems, or optimizing configurations subject to rules.
---

# Constraint Optimization

## Problem Formulation

Identify three components before coding:
1. **Decision variables**: What you're choosing (locations, items, assignments)
2. **Objective**: What to maximize/minimize (coverage, value, cost)
3. **Constraints**: Rules to satisfy (capacity, distances, exclusions)

## Three-Phase Method (Coverage/Placement Problems)

### Phase 1: Prune Search Space
Eliminate candidates violating hard constraints first (blocked cells, boundaries). For pairwise constraints (min distance), filter after each placement.

### Phase 2: Score by Marginal Gain
Score each candidate by **marginal** benefit — new coverage added, not total. Use sets to avoid double-counting covered cells.

### Phase 3: Greedy + Local Search
1. Pick highest-scoring candidate as anchor
2. Greedily add best marginal-gain candidate, pruning infeasible after each step
3. After construction, try swapping each selected with each unselected; accept improvements

```python
# Constraint propagation: prune after each selection
def get_feasible(fixed, candidates, min_dist):
    return [c for c in candidates
            if all(manhattan(c, f) >= min_dist for f in fixed)]

# Coverage gain: count only NEW population covered
def coverage_gain(facility, covered_set, population, radius):
    return sum(population[r][c] for r in range(N) for c in range(N)
               if (r,c) not in covered_set and manhattan(facility,(r,c)) <= radius)
```

## 0/1 Knapsack (Dynamic Programming)

Greedy by value/weight ratio is **not optimal** for 0/1 knapsack. Use DP:

```python
dp = [[0]*(W+1) for _ in range(n+1)]
for i in range(1, n+1):
    w, v = items[i-1]['weight'], items[i-1]['value']
    for cap in range(W+1):
        dp[i][cap] = dp[i-1][cap] if w > cap else max(dp[i-1][cap], dp[i-1][cap-w]+v)

# Traceback selected items
selected, cap = [], W
for i in range(n, 0, -1):
    if dp[i][cap] != dp[i-1][cap]:
        selected.append(items[i-1])
        cap -= items[i-1]['weight']
```

Complexity: O(n·W) time and space.

## Key Pitfalls

- **Manhattan distance**: `|r1-r2| + |c1-c2|` — confirm which distance metric the problem uses
- **Coverage double-counting**: Use a set of covered cells, not a running sum
- **Greedy ≠ optimal for 0/1 knapsack**: Always use DP when items can't be split
- **Prune after each placement**: Constraint propagation prevents exponential search
- **Local optima**: Apply swap-based local search after greedy construction
