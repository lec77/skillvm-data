---
name: timeseries-analysis
description: Analyze time series data with HP filtering, detrending, seasonal decomposition, and anomaly detection.
---

# Time Series Analysis

## HP Filter (Hodrick-Prescott)

Decomposes series into trend + cycle. **Always log-transform level data first.**

Lambda: Annual=100, Quarterly=1600, Monthly=14400

```python
import numpy as np
import json

def hp_filter(y, lam):
    n = len(y)
    D = np.zeros((n - 2, n))
    for i in range(n - 2):
        D[i, i] = 1
        D[i, i + 1] = -2
        D[i, i + 2] = 1
    A = np.eye(n) + lam * D.T @ D
    trend = np.linalg.solve(A, y)
    cycle = y - trend
    return trend, cycle

# For level data (GDP, consumption): MUST log-transform first
log_series = np.log(raw_series)
trend, cycle = hp_filter(log_series, 1600)  # quarterly lambda
# cycle = log_actual - log_trend (percentage deviations, mean ≈ 0)
```

### Correlation between cyclical components

```python
from scipy.stats import pearsonr
r, pval = pearsonr(gdp_cycle, cons_cycle)
```

### Output format for detrending tasks

Write a single JSON file with all arrays as plain lists of numbers:
```python
results = {
    "gdp_trend": trend_gdp.tolist(),
    "gdp_cycle": cycle_gdp.tolist(),
    "cons_trend": trend_cons.tolist(),
    "cons_cycle": cycle_cons.tolist(),
    "cyclical_correlation": float(correlation)
}
with open("detrending_results.json", "w") as f:
    json.dump(results, f)
```

**IMPORTANT**: Do NOT create visualization scripts or summary reports. Just write the JSON output file and verify it exists.

## Anomaly Detection (Rolling Z-Score)

```python
import pandas as pd
import numpy as np
import json

df = pd.read_csv("sales_data.csv")
window = 14

# CRITICAL: use min_periods=window (NOT min_periods=1)
rolling_mean = df["sales"].rolling(window=window, min_periods=window).mean()
rolling_std = df["sales"].rolling(window=window, min_periods=window).std()

df["z_score"] = (df["sales"] - rolling_mean) / rolling_std

# Only consider rows where rolling stats are available (skip first window-1 rows)
valid = df.dropna(subset=["z_score"]).copy()
anomalies_df = valid[valid["z_score"].abs() > 2.5]

anomalies = []
for _, row in anomalies_df.iterrows():
    anomalies.append({
        "date": str(row["date"]),
        "sales": float(row["sales"]),
        "z_score": round(float(row["z_score"]), 4),
        "type": "spike" if row["z_score"] > 0 else "dip"
    })

report = {
    "anomalies": anomalies,
    "total_anomalies": len(anomalies),
    "mean_sales": round(float(df["sales"].mean()), 2),
    "std_sales": round(float(df["sales"].std()), 2)
}

with open("anomaly_report.json", "w") as f:
    json.dump(report, f)
```

### Anomaly types
- **Spike**: z_score > +2.5 (large positive deviation)
- **Dip**: z_score < -2.5 (large negative deviation)

## Key Rules

1. **Log-transform** level data before HP filtering — never filter raw levels or growth rates
2. Use `min_periods=window` for rolling statistics — never `min_periods=1`
3. Ensure all numeric values in JSON are proper numbers (use `float()`, `round()`)
4. Write output JSON files directly — do not create extra visualization or summary files
5. Verify the output file exists after writing
6. Use `python3` to run scripts (not `python`)
