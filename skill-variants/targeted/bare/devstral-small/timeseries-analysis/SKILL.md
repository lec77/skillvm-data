---
name: timeseries-analysis
description: Time series anomaly detection and HP filter detrending with ready-to-use Python code
---

# Time Series Analysis

## Anomaly Detection with Rolling Z-Score

To detect anomalies in daily sales data, write a single Python script:

```python
import pandas as pd
import numpy as np
import json

df = pd.read_csv("sales_data.csv")
df["date"] = pd.to_datetime(df["date"])
df = df.sort_values("date").reset_index(drop=True)

window = 14
df["rolling_mean"] = df["sales"].rolling(window=window, min_periods=window).mean()
df["rolling_std"] = df["sales"].rolling(window=window, min_periods=window).std()
df["z_score"] = (df["sales"] - df["rolling_mean"]) / df["rolling_std"]

threshold = 2.5
mask = df["z_score"].abs() > threshold
anomalies = df[mask].copy()
anomalies["type"] = anomalies["z_score"].apply(lambda z: "spike" if z > 0 else "dip")

result = {
    "anomalies": [
        {"date": row["date"].strftime("%Y-%m-%d"), "sales": float(row["sales"]),
         "z_score": float(row["z_score"]), "type": row["type"]}
        for _, row in anomalies.iterrows()
    ],
    "total_anomalies": len(anomalies),
    "mean_sales": float(df["sales"].mean()),
    "std_sales": float(df["sales"].std())
}

with open("anomaly_report.json", "w") as f:
    json.dump(result, f, indent=2)
```

Output: `anomaly_report.json` with keys: anomalies (array of {date, sales, z_score, type}), total_anomalies, mean_sales, std_sales.

## Hodrick-Prescott Filter Detrending

To apply HP filter to quarterly macroeconomic data, write a single Python script:

```python
import pandas as pd
import numpy as np
from scipy.stats import pearsonr
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

df = pd.read_csv("macro_data.csv")

log_gdp = np.log(df["gdp"].values)
log_cons = np.log(df["consumption"].values)

gdp_trend, gdp_cycle = hp_filter(log_gdp, lam=1600)
cons_trend, cons_cycle = hp_filter(log_cons, lam=1600)

corr, _ = pearsonr(gdp_cycle, cons_cycle)

result = {
    "gdp_trend": gdp_trend.tolist(),
    "gdp_cycle": gdp_cycle.tolist(),
    "cons_trend": cons_trend.tolist(),
    "cons_cycle": cons_cycle.tolist(),
    "cyclical_correlation": float(corr)
}

with open("detrending_results.json", "w") as f:
    json.dump(result, f, indent=2)
```

Output: `detrending_results.json` with keys: gdp_trend (array), gdp_cycle (array), cons_trend (array), cons_cycle (array), cyclical_correlation (number).

## Key Rules
- Always log-transform level data (GDP, consumption) before HP filtering
- Use lambda=1600 for quarterly data
- Rolling z-score: window=14, threshold=2.5 for daily anomaly detection
- Classify anomalies as "spike" (z>0) or "dip" (z<0)
