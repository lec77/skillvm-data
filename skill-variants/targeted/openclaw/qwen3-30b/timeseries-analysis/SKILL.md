---
name: timeseries-analysis
description: HP filtering, detrending, and anomaly detection for time series data.
---

# Time Series Analysis

## CRITICAL RULES

1. Always use `python3` (not `python`) to run scripts.
2. Always write a Python script to a .py file and execute it. NEVER try to compute results mentally or hardcode values.
3. Do NOT use scipy — it may not be installed. Use numpy only for all computations including correlation.
4. When writing JSON output, use `json.dump()` with the exact key names requested.
5. After running the script, verify the output file exists.

## HP Filter Implementation

The HP filter decomposes y_t into trend + cycle by solving a penalized least squares problem.

```python
import numpy as np
import pandas as pd
import json

def hp_filter(y, lam):
    """HP filter: returns (trend, cycle)."""
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

def pearson_corr(x, y):
    """Pearson correlation using numpy only."""
    xm = x - np.mean(x)
    ym = y - np.mean(y)
    return float(np.sum(xm * ym) / (np.sqrt(np.sum(xm**2)) * np.sqrt(np.sum(ym**2))))
```

### HP Detrending Steps for Level Variables (GDP, consumption)

1. Read CSV with pandas
2. Log-transform both series: `log_series = np.log(series)`
3. Apply HP filter to each log series with lambda=1600
4. Cycle = log_actual - log_trend (already returned by hp_filter)
5. Compute Pearson correlation between the two cycle arrays using `pearson_corr()`
6. Write JSON with arrays as `.tolist()`

## Anomaly Detection with Rolling Z-Score

```python
import pandas as pd
import numpy as np
import json

def detect_anomalies(csv_path, window=14, threshold=2.5):
    df = pd.read_csv(csv_path)
    sales = df['sales'].values
    dates = df['date'].values

    rolling_mean = pd.Series(sales).rolling(window=window, min_periods=window).mean().values
    rolling_std = pd.Series(sales).rolling(window=window, min_periods=window).std().values

    anomalies = []
    for i in range(len(sales)):
        if np.isnan(rolling_mean[i]) or np.isnan(rolling_std[i]) or rolling_std[i] == 0:
            continue
        z = (sales[i] - rolling_mean[i]) / rolling_std[i]
        if abs(z) > threshold:
            anomalies.append({
                "date": str(dates[i]),
                "sales": float(sales[i]),
                "z_score": round(float(z), 4),
                "type": "spike" if z > 0 else "dip"
            })

    result = {
        "anomalies": anomalies,
        "total_anomalies": len(anomalies),
        "mean_sales": round(float(np.mean(sales)), 2),
        "std_sales": round(float(np.std(sales)), 2)
    }

    with open('anomaly_report.json', 'w') as f:
        json.dump(result, f, indent=2)
    print(f"Found {len(anomalies)} anomalies")

detect_anomalies('sales_data.csv')
```

### Lambda by Frequency

| Frequency | Lambda |
|-----------|--------|
| Annual | 100 |
| Quarterly | 1600 |
| Monthly | 14400 |
