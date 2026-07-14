---
name: constraint-optimization
description: Solve combinatorial and constraint optimization problems using pruning, greedy heuristics, and local search. Use when placing items on grids, scheduling with constraints, solving assignment problems, or optimizing configurations subject to rules.
---

# Constraint Optimization

## Problem Formulation

Every constraint optimization problem has three components:

1. **Decision variables**: What you are choosing (e.g., facility locations, item selections, assignments)
2. **Objective function**: What to maximize or minimize (e.g., total coverage, total value, total cost)
3. **Constraints**: Rules that must be satisfied (e.g., capacity limits, minimum distances, exclusion zones)

Always write these down explicitly before coding. Ambiguous constraints are the leading cause of wrong solutions.

## The Three-Phase Method

### Phase 1: Prune the Search Space

Before evaluating candidates, eliminate those that violate hard constraints. This typically reduces the candidate set by 70–90%.

```python
valid_cells = [
    (r, c)
    for r in range(grid_size)
    for c in range(grid_size)
    if (r, c) not in blocked_set
]
```

For pairwise constraints (e.g., minimum distance between facilities), filter combinations early rather than checking all pairs after the fact.

### Phase 2: Score Remaining Candidates

Assign each candidate a score combining:
- **Intrinsic value**: The direct benefit of choosing this candidate (e.g., local population density)
- **Interaction potential**: How well it complements already-chosen candidates (e.g., coverage of uncovered areas)

For coverage problems, score by the marginal population newly covered, not total population in range.

### Phase 3: Anchor-Based Search

1. Pick the highest-scoring candidate as the first anchor
2. Greedily add the candidate with the best marginal gain
3. After greedy construction, apply local search: try swapping each selected item with each unselected item; accept improvements

This gives near-optimal solutions in O(k·n) time where k is the number of items to select and n is the candidate pool size.

## Greedy Algorithms

**When to use**: Problems where locally optimal choices lead to globally good solutions. Examples: knapsack (by value/weight ratio), interval scheduling (by end time), minimum spanning tree.

**Template**:
```python
items.sort(key=lambda x: x['value'] / x['weight'], reverse=True)
selected, weight = [], 0
for item in items:
    if weight + item['weight'] <= capacity:
        selected.append(item)
        weight += item['weight']
```

**Time complexity**: O(n log n) for sorting, O(n) for selection.

**Limitation**: Greedy is not always optimal for 0/1 knapsack. Use dynamic programming for exact solutions when n is small (< 10,000 items, capacity < 100,000).

## Dynamic Programming for 0/1 Knapsack

When greedy is insufficient (each item can be taken at most once, integer quantities), use DP:

```python
n, W = len(items), capacity
dp = [[0] * (W + 1) for _ in range(n + 1)]
for i in range(1, n + 1):
    w, v = items[i-1]['weight'], items[i-1]['value']
    for cap in range(W + 1):
        if w > cap:
            dp[i][cap] = dp[i-1][cap]
        else:
            dp[i][cap] = max(dp[i-1][cap], dp[i-1][cap - w] + v)

# Traceback to find selected items
selected, cap = [], W
for i in range(n, 0, -1):
    if dp[i][cap] != dp[i-1][cap]:
        selected.append(items[i-1])
        cap -= items[i-1]['weight']
```

**Time complexity**: O(n·W). **Space**: O(n·W) or O(W) with rolling array.

## Local Search / Hill Climbing

After any initial solution, improve it by exploring neighbors:

```python
improved = True
while improved:
    improved = False
    for i in selected:
        for j in not_selected:
            if swap_improves(i, j, current_solution):
                do_swap(i, j)
                improved = True
                break
```

**Restart strategy**: If stuck in a local optimum, restart from a different random initial solution and keep the best result across all restarts.

## Constraint Propagation

When you fix one variable, immediately eliminate values for other variables that are now incompatible:

```python
def get_feasible_next(fixed_facilities, all_cells, min_dist):
    return [
        c for c in all_cells
        if all(manhattan(c, f) >= min_dist for f in fixed_facilities)
    ]
```

Apply this after each greedy selection to prune the next candidate pool.

## Linear Programming

For continuous relaxations or LP-solvable problems, use `scipy.optimize`:

```python
from scipy.optimize import linprog, linear_sum_assignment
import numpy as np

# Minimize c @ x subject to A_ub @ x <= b_ub, bounds
result = linprog(c, A_ub=A, b_ub=b, bounds=bounds, method='highs')

# Assignment problem (Hungarian algorithm) — O(n^3)
row_ind, col_ind = linear_sum_assignment(cost_matrix)
```

Use `milp` (mixed-integer LP) for problems with binary decision variables when n is large enough that brute force is infeasible.

## Coverage Problems

For facility placement maximizing coverage:

1. Precompute which cells each candidate facility covers (store as sets)
2. Use greedy: pick facility with most uncovered population, update covered set, repeat
3. Refine with local search: try replacing each placed facility with each unplaced candidate

```python
def coverage_gain(facility, covered, population, radius, grid_size):
    gain = 0
    for r in range(grid_size):
        for c in range(grid_size):
            if (r, c) not in covered and manhattan(facility, (r, c)) <= radius:
                gain += population[r][c]
    return gain
```

## Assignment Problem

When assigning n workers to n jobs to minimize total cost:

```python
from scipy.optimize import linear_sum_assignment
cost_matrix = np.array([[cost(worker, job) for job in jobs] for worker in workers])
row_ind, col_ind = linear_sum_assignment(cost_matrix)
total_cost = cost_matrix[row_ind, col_ind].sum()
```

This runs in O(n³) and always finds the global optimum.

## Common Pitfalls

- **Local optima**: Greedy and hill climbing can get stuck. Always try multiple restarts.
- **Off-by-one in distances**: Manhattan distance `|r1-r2| + |c1-c2|`. Euclidean is `sqrt((r1-r2)² + (c1-c2)²)`. Confirm which the problem requires.
- **Coverage double-counting**: A cell covered by two facilities should be counted once. Use a set, not a sum.
- **Ignoring constraint propagation**: Failing to prune after each placement leads to exponentially larger search spaces.
- **Greedy for 0/1 knapsack**: Value/weight ratio greedy is not exact for 0/1 knapsack. Use DP for guaranteed optimality.
- **Integer vs. continuous**: LP relaxations may give fractional solutions; round carefully or use MILP.
