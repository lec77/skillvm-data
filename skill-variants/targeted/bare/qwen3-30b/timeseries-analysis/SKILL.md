---
name: timeseries-analysis
description: HP filtering, detrending, and anomaly detection for time series data.
---

# Time Series Analysis

**IMPORTANT: Always write a Python script and execute it. Never compute values manually.**

## HP Filter

Decomposes series into trend + cycle. Lambda: Annual=100, Quarterly=1600, Monthly=14400.

```python
import numpy as np

def hp_filter(y, lam):
    n = len(y)
    D = np.zeros((n - 2, n))
    for i in range(n - 2):
        D[i, i] = 1; D[i, i+1] = -2; D[i, i+2] = 1
    A = np.eye(n) + lam * D.T @ D
    trend = np.linalg.solve(A, y)
    return trend, y - trend
```

### Detrending Level Variables (GDP, Consumption)

**Always log-transform first**, then HP-filter. Cycle = percentage deviations from trend.

```python
log_series = np.log(series)
trend, cycle = hp_filter(log_series, lam=1600)  # quarterly
```

- Cycle mean ≈ 0; trend is monotonically increasing for growth series
- Use `scipy.stats.pearsonr(gdp_cycle, cons_cycle)` for cyclical correlation

## Rolling Z-Score Anomaly Detection

Write a Python script that:
1. Reads the CSV with pandas
2. Computes rolling mean and std with the specified window
3. Computes z-scores: `z = (value - rolling_mean) / rolling_std`
4. Flags anomalies where `|z| > threshold`
5. Classifies as "spike" (z > 0) or "dip" (z < 0)
6. Writes results to JSON with `json.dump()`

```python
import pandas as pd
import numpy as np
import json

df = pd.read_csv("sales_data.csv")
sales = df["sales"]

roll_mean = sales.rolling(window=14, min_periods=14).mean()
roll_std = sales.rolling(window=14, min_periods=14).std()
z = (sales - roll_mean) / roll_std

anomalies = []
for i in range(len(df)):
    if pd.notna(z.iloc[i]) and abs(z.iloc[i]) > 2.5:
        anomalies.append({
            "date": df["date"].iloc[i],
            "sales": float(sales.iloc[i]),
            "z_score": round(float(z.iloc[i]), 4),
            "type": "spike" if z.iloc[i] > 0 else "dip"
        })

result = {
    "anomalies": anomalies,
    "total_anomalies": len(anomalies),
    "mean_sales": round(float(sales.mean()), 4),
    "std_sales": round(float(sales.std()), 4)
}

with open("anomaly_report.json", "w") as f:
    json.dump(result, f, indent=2)
print("Done:", len(anomalies), "anomalies found")
```

## Pitfalls

- Filter log-levels, never differenced data
- Handle rolling std=0 (skip z-score)
- HP filter unreliable at endpoints (~4 obs)
- Always use `json.dump()` to write JSON — never construct JSON strings manually
