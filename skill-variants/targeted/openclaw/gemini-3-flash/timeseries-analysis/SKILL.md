---
name: timeseries-analysis
description: Analyze time series data with HP filtering, detrending, seasonal decomposition, and anomaly detection. Use when working with economic data, sales trends, or any temporal patterns.
---

# Time Series Analysis

Practical guide to decomposing, detrending, and detecting anomalies in time series data. Covers the Hodrick-Prescott filter for business-cycle extraction, seasonality decomposition, and statistical anomaly detection.

## When to Use

- Extracting trend and cycle from GDP, consumption, or other macroeconomic series
- Removing long-run trends to analyze short-run fluctuations
- Detecting unusual observations in daily or weekly sales data
- Identifying seasonal patterns and level shifts
- Computing cross-correlations between cyclical components of related series

## Hodrick-Prescott (HP) Filter

The HP filter decomposes a series $y_t$ into a trend $\tau_t$ and cyclical component $c_t = y_t - \tau_t$ by minimizing:

$$\sum_{t=1}^T (y_t - \tau_t)^2 + \lambda \sum_{t=2}^{T-1} [(\tau_{t+1} - \tau_t) - (\tau_t - \tau_{t-1})]^2$$

### Lambda by Observation Frequency

| Frequency | Lambda |
|-----------|--------|
| Annual    | 100    |
| Quarterly | 1600   |
| Monthly   | 14400  |

### Implementation in Python

```python
import numpy as np

def hp_filter(y, lam):
    """
    Hodrick-Prescott filter.
    Returns (trend, cycle) where cycle = y - trend.
    """
    n = len(y)
    # Build second-difference matrix
    D = np.zeros((n - 2, n))
    for i in range(n - 2):
        D[i, i]     =  1
        D[i, i + 1] = -2
        D[i, i + 2] =  1
    # Solve: (I + lam * D'D) * trend = y
    A = np.eye(n) + lam * D.T @ D
    trend = np.linalg.solve(A, y)
    cycle = y - trend
    return trend, cycle
```

### Step-by-Step: HP Detrending of Level Variables

For GDP, consumption, or other level series, **always log-transform first** to work in percentage deviations:

```python
import numpy as np

def hp_detrend_level(series, lam=1600):
    """
    Log-transform then HP-filter. Returns trend and cycle in log space.
    Cycle represents percentage deviations from trend.
    """
    log_series = np.log(series)
    trend, cycle = hp_filter(log_series, lam)
    return trend, cycle  # both in log units

# Usage: quarterly GDP
gdp = np.array([...])       # raw levels
trend, cycle = hp_detrend_level(gdp, lam=1600)
# cycle[t] ≈ percent deviation from trend at quarter t
```

### Cyclical Component Properties

- Mean of cycle should be approximately zero
- Cycle captures short-run fluctuations (business cycles)
- Trend captures long-run growth path
- Cross-correlations between cycles of GDP and consumption reveal co-movement

```python
from scipy.stats import pearsonr

# Compute correlation between GDP and consumption cyclical components
r, pval = pearsonr(gdp_cycle, cons_cycle)
print(f"Cyclical correlation: {r:.4f}  (p={pval:.4f})")
```

## Seasonal Decomposition

For series with weekly or annual seasonality, decompose into trend + seasonal + residual:

```python
from statsmodels.tsa.seasonal import seasonal_decompose
import pandas as pd

# Additive decomposition (when seasonal amplitude is constant)
result = seasonal_decompose(series, model='additive', period=7)  # weekly
trend    = result.trend     # long-run level
seasonal = result.seasonal  # repeating pattern
residual = result.resid     # remaining noise

# Multiplicative (when amplitude grows with level)
result = seasonal_decompose(series, model='multiplicative', period=7)
```

## Anomaly Detection

### Rolling Z-Score Method

Flag observations that deviate strongly from recent history:

```python
import pandas as pd
import numpy as np

def rolling_zscore_anomalies(series, window=14, threshold=2.5):
    """
    Compute rolling z-scores and flag anomalies.
    Returns DataFrame with z_score column and is_anomaly boolean.
    """
    s = pd.Series(series)
    rolling_mean = s.rolling(window=window, min_periods=window).mean()
    rolling_std  = s.rolling(window=window, min_periods=window).std()

    z_score = (s - rolling_mean) / rolling_std
    is_anomaly = z_score.abs() > threshold

    return pd.DataFrame({
        'value':     s,
        'z_score':   z_score,
        'is_anomaly': is_anomaly,
    })

df = rolling_zscore_anomalies(sales, window=14, threshold=2.5)
anomalies = df[df['is_anomaly']].reset_index()
```

### Anomaly Index (Prophet-Based)

When a full seasonal model is available, use a normalized anomaly index:

```
anomaly_index = 100 * tanh(deviation / std_residual)
```

- Range: [-100, 100]
- Values near ±100 indicate extreme anomalies
- Values near 0 indicate normal behavior

```python
import numpy as np

def anomaly_index(deviation, std_residual):
    """Normalize deviation into [-100, 100] range."""
    return 100 * np.tanh(deviation / std_residual)
```

### Anomaly Classification

| Type | Characteristic | Z-score |
|------|---------------|---------|
| Spike | Large positive deviation, single point | z >> +2.5 |
| Dip | Large negative deviation, single point | z << -2.5 |
| Level shift | Sustained deviation over multiple periods | Several consecutive z > threshold |

## Cross-Correlation Analysis

```python
import numpy as np

def cross_correlation(x, y, max_lag=12):
    """
    Compute cross-correlation between two detrended series at lags 0..max_lag.
    Positive lag: y leads x; negative lag: x leads y.
    """
    results = {}
    for lag in range(-max_lag, max_lag + 1):
        if lag >= 0:
            r = np.corrcoef(x[lag:], y[:len(y)-lag])[0, 1] if lag < len(x) else 0
        else:
            r = np.corrcoef(x[:len(x)+lag], y[-lag:])[0, 1] if -lag < len(y) else 0
        results[lag] = r
    return results
```

## Common Pitfalls

- **Never apply HP filter to differenced data** — filter log-levels, not growth rates
- **Lambda matters**: using 1600 on monthly data over-smooths; use 14400 for monthly
- **Rolling std of zero**: skip z-score computation when window is constant (std=0)
- **End-point problem**: HP filter is unreliable near series endpoints (first/last ~4 observations); treat with caution
- **Correlation vs. co-movement**: positive cyclical correlation means series move together over the business cycle, not necessarily at every quarter
