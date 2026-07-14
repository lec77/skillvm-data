---
name: timeseries-analysis
description: Analyze time series data with HP filtering and anomaly detection using Python scripts. Use for economic data detrending or sales anomaly detection.
---

# Time Series Analysis

Write a single Python script that reads CSV, processes data, and writes JSON output. Use only numpy, pandas, scipy (already installed).

## HP Filter Detrending

Complete script for HP filter on economic data:

```python
import numpy as np
import pandas as pd
import json
from scipy.stats import pearsonr

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
gdp = df["gdp"].values
cons = df["consumption"].values

log_gdp = np.log(gdp)
log_cons = np.log(cons)

gdp_trend, gdp_cycle = hp_filter(log_gdp, 1600)
cons_trend, cons_cycle = hp_filter(log_cons, 1600)

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
print("Done")
```

## Rolling Z-Score Anomaly Detection

Complete script for detecting anomalies in daily data:

```python
import pandas as pd
import numpy as np
import json

df = pd.read_csv("sales_data.csv")
sales = df["sales"].values
dates = df["date"].values

rolling_mean = pd.Series(sales).rolling(window=14, min_periods=14).mean().values
rolling_std = pd.Series(sales).rolling(window=14, min_periods=14).std().values

anomalies = []
for i in range(len(sales)):
    if np.isnan(rolling_mean[i]) or np.isnan(rolling_std[i]) or rolling_std[i] == 0:
        continue
    z = (sales[i] - rolling_mean[i]) / rolling_std[i]
    if abs(z) > 2.5:
        anomalies.append({
            "date": str(dates[i]),
            "sales": float(sales[i]),
            "z_score": float(z),
            "type": "spike" if z > 0 else "dip"
        })

result = {
    "anomalies": anomalies,
    "total_anomalies": len(anomalies),
    "mean_sales": float(np.mean(sales)),
    "std_sales": float(np.std(sales))
}

with open("anomaly_report.json", "w") as f:
    json.dump(result, f, indent=2)
print("Done")
```

## Workflow

1. Read the CSV file to understand its columns
2. Write a Python script (adapt the template above to match the data)
3. Run the script with `python script.py`
4. Verify the JSON output file was created
