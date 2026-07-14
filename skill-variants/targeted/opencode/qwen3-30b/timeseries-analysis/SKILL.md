---
name: timeseries-analysis
description: Analyze time series data with HP filtering, detrending, seasonal decomposition, and anomaly detection.
---

# Time Series Analysis

IMPORTANT: Do NOT ask questions. Do NOT delegate to sub-agents. Write and run code directly.

## HP Filter (Hodrick-Prescott)

Decomposes series into trend + cycle. The trend is smooth and increasing for growing data. The cycle = actual - trend and has mean ≈ 0.

### Python implementation — copy this exactly:

```python
import numpy as np
import json

def hp_filter(y, lam=1600):
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
```

### For GDP/consumption data — ALWAYS log-transform first:

```python
log_gdp = np.log(gdp_values)
gdp_trend, gdp_cycle = hp_filter(log_gdp, lam=1600)
```

After this: `gdp_trend` is an array of 60 smoothly increasing values (in log space). `gdp_cycle` is small values near zero (percentage deviations from trend).

### Lambda values:
- Quarterly data: lambda=1600
- Monthly data: lambda=14400
- Annual data: lambda=100

### Pearson correlation between cyclical components:
```python
from scipy.stats import pearsonr
corr, _ = pearsonr(gdp_cycle, cons_cycle)
```

## Anomaly Detection — Rolling Z-Score

```python
import pandas as pd
import numpy as np
import json

df = pd.read_csv("sales_data.csv")
df["rolling_mean"] = df["sales"].rolling(window=14, min_periods=14).mean()
df["rolling_std"] = df["sales"].rolling(window=14, min_periods=14).std()
df["z_score"] = (df["sales"] - df["rolling_mean"]) / df["rolling_std"]

anomalies = df[df["z_score"].abs() > 2.5].copy()
anomaly_list = []
for _, row in anomalies.iterrows():
    anomaly_list.append({
        "date": row["date"],
        "sales": float(row["sales"]),
        "z_score": float(row["z_score"]),
        "type": "spike" if row["z_score"] > 0 else "dip"
    })

result = {
    "anomalies": anomaly_list,
    "total_anomalies": len(anomaly_list),
    "mean_sales": float(df["sales"].mean()),
    "std_sales": float(df["sales"].std())
}

with open("anomaly_report.json", "w") as f:
    json.dump(result, f, indent=2)
```

### Anomaly types:
- Spike: z_score > +2.5 (unusually high value)
- Dip: z_score < -2.5 (unusually low value)
