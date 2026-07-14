---
name: timeseries-analysis
description: HP filtering, detrending, and anomaly detection for time series data.
---

# Time Series Analysis

## HP Filter

Decomposes series into trend + cycle by minimizing:
$$\sum(y_t - \tau_t)^2 + \lambda \sum[(\tau_{t+1} - \tau_t) - (\tau_t - \tau_{t-1})]^2$$

**Lambda**: Annual=100, Quarterly=1600, Monthly=14400

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

```python
import pandas as pd, numpy as np

def rolling_zscore_anomalies(series, window=14, threshold=2.5):
    s = pd.Series(series)
    roll_mean = s.rolling(window=window, min_periods=window).mean()
    roll_std = s.rolling(window=window, min_periods=window).std()
    z = (s - roll_mean) / roll_std
    return pd.DataFrame({'value': s, 'z_score': z, 'is_anomaly': z.abs() > threshold})
```

**Anomaly types**: Spike (z >> +2.5), Dip (z << -2.5), Level shift (consecutive z > threshold)

## Pitfalls

- Filter log-levels, never differenced data
- Handle rolling std=0 (skip z-score)
- HP filter unreliable at endpoints (~4 obs)
