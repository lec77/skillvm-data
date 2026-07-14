---
name: energy-optimization
description: Solve power systems optimization problems including DC power flow, economic dispatch, and optimal power flow. Use when computing bus angles, line flows, or minimizing generation costs.
---

## DC Power Flow

### CRITICAL: Per-Unit System

Network data uses **per-unit reactance** on Sbase = 100 MVA. Power values (loads, generation) are in MW. You MUST account for this:

- B-matrix entry: `b_ij = Sbase / x_ij` (NOT `1 / x_ij`)
- This ensures `B * theta = P_MW` directly, with theta in radians
- Resulting angles will be small (typically |theta| < 0.5 rad)

**If your angles are > 1.0 radian, you forgot to multiply by Sbase. This is the #1 error.**

### Line Flow Formula

```
P_ij (MW) = Sbase * (theta_i - theta_j) / x_ij
```

Where Sbase = 100, theta in radians, x in per-unit.

### Complete Algorithm (TypeScript)

```typescript
const Sbase = 100; // MVA base

function dcPowerFlow(buses: any[], lines: any[], generators: any[]) {
  const n = buses.length;

  // Build B-matrix: use Sbase/x, NOT 1/x
  const B: number[][] = Array.from({length: n}, () => new Array(n).fill(0));
  for (const line of lines) {
    const i = line.from, j = line.to;
    const b = Sbase / line.reactance;  // MUST include Sbase
    B[i][i] += b;
    B[j][j] += b;
    B[i][j] -= b;
    B[j][i] -= b;
  }

  // Net power injection (MW): generation minus load
  const P = new Array(n).fill(0);
  for (const bus of buses) P[bus.id] -= bus.load || 0;
  for (const gen of generators) P[gen.bus] += gen.dispatch;

  // Remove slack bus (index 0), solve reduced system
  const size = n - 1;
  const A: number[][] = [];
  const rhs: number[] = [];
  for (let i = 1; i < n; i++) {
    const row: number[] = [];
    for (let j = 1; j < n; j++) row.push(B[i][j]);
    A.push(row);
    rhs.push(P[i]);
  }

  // Gaussian elimination with partial pivoting
  const aug = A.map((row, i) => [...row, rhs[i]]);
  for (let col = 0; col < size; col++) {
    let maxRow = col;
    for (let row = col + 1; row < size; row++)
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    for (let row = col + 1; row < size; row++) {
      const f = aug[row][col] / aug[col][col];
      for (let j = col; j <= size; j++) aug[row][j] -= f * aug[col][j];
    }
  }
  const theta_red = new Array(size).fill(0);
  for (let i = size - 1; i >= 0; i--) {
    theta_red[i] = aug[i][size];
    for (let j = i + 1; j < size; j++) theta_red[i] -= aug[i][j] * theta_red[j];
    theta_red[i] /= aug[i][i];
  }

  const theta = [0.0, ...theta_red]; // slack = 0

  // Line flows in MW
  const line_flows = lines.map((l: any) =>
    Sbase * (theta[l.from] - theta[l.to]) / l.reactance
  );

  return { theta, line_flows };
}
```

### Verification Checklist

After computing, verify:
1. `theta[0] === 0` (slack bus)
2. All `|theta[i]| < 0.5` radians — if > 1.0, you forgot Sbase
3. Total generation = total load
4. All `|line_flow[i]| <= limit[i]`

---

## Economic Dispatch

Minimize total cost subject to power balance and generator limits.

### Cost: `C(P) = a*P² + b*P + c`

Marginal cost: `dC/dP = 2*a*P + b`

### Lambda Iteration

At optimum, unconstrained generators have equal marginal cost λ:
```
P_i = (λ - b_i) / (2 * a_i)    then clamp to [min, max]
```

### Complete Algorithm (TypeScript)

```typescript
function economicDispatch(gens: any[], demand: number) {
  let lo = Math.min(...gens.map(g => 2 * g.a * g.min + g.b));
  let hi = Math.max(...gens.map(g => 2 * g.a * g.max + g.b));
  let dispatch: number[] = [];
  let lambda = 0;

  for (let i = 0; i < 200; i++) {
    lambda = (lo + hi) / 2;
    dispatch = gens.map(g => {
      const p = (lambda - g.b) / (2 * g.a);
      return Math.max(g.min, Math.min(g.max, p)); // CLAMP always
    });
    const total = dispatch.reduce((s, p) => s + p, 0);
    if (Math.abs(total - demand) < 1e-6) break;
    if (total < demand) lo = lambda; else hi = lambda;
  }

  return { dispatch, lambda };
}

// Cost for each generator
function cost(g: any, p: number) {
  return g.a * p * p + g.b * p + g.c;
}
```

### CRITICAL: Verify Before Writing Output

After computing dispatch, verify ALL of these:
1. Each `power` is within `[gen.min, gen.max]` — if not, clamping was missed
2. Sum of all powers === total_demand (within 0.01)
3. Each `cost === a * power² + b * power + c` (within 0.1)
4. `total_cost === sum of individual costs`
5. `lambda > 0`

**Write dispatch.json only after all checks pass.** If a check fails, fix the computation first.

---

## Output Formats

### power_flow.json

```json
{
  "bus_angles": [0.0, -0.0653, -0.0820, 0.0045, -0.1105],
  "line_flows": [65.3, 54.7, 13.9, 1.5, 28.5, 31.5],
  "generation": [120.0, 60.0]
}
```

- `bus_angles`: N radians, index 0 = 0.0 (slack). Values should be small (< 0.5 rad).
- `line_flows`: MW, same order as input lines array, positive = from→to
- `generation`: MW, same order as input generators array

### dispatch.json

```json
{
  "dispatch": [
    {"id": 0, "power": 100.0, "cost": 1340.0},
    {"id": 1, "power": 200.0, "cost": 1840.0}
  ],
  "total_cost": 3180.0,
  "lambda": 8.8
}
```

- `dispatch[i].id`: generator id from input
- `dispatch[i].power`: MW dispatched (must be within [min, max])
- `dispatch[i].cost`: `a * power² + b * power + c`
- `total_cost`: sum of all individual costs
- `lambda`: optimal marginal cost (positive number)
