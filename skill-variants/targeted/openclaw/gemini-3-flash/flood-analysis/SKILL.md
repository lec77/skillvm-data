---
name: flood-analysis
description: Analyze streamflow data for flood risk assessment. Use when processing USGS water data, detecting flood events, computing return periods, or classifying flood severity.
---

# Flood Analysis Skill

Analyze USGS streamflow data to assess flood risk, detect flood events, and estimate return periods using standard hydrological methods.

---

## USGS Streamflow Data

USGS water data is typically reported at 15-minute intervals with two primary measurements:

- **Gage height** (ft): water surface elevation at the monitoring station
- **Discharge** (cubic ft/s, cfs): volumetric flow rate

### Aggregating to Daily Values

Convert 15-minute instantaneous readings to daily maxima using pandas:

```python
import pandas as pd

df = pd.read_csv('streamflow.csv', parse_dates=['datetime'])
df = df.set_index('datetime')

# Daily maximum discharge
daily_max = df['discharge_cfs'].resample('D').max()
```

---

## NWS Flood Stage Thresholds

The National Weather Service defines four flood severity levels in ascending order:

| Stage | Meaning |
|-------|---------|
| **Action** | Water nearing flood stage; take preparatory action |
| **Minor** | Minimal or no property damage; some public threat |
| **Moderate** | Some inundation of structures and roads |
| **Major** | Extensive inundation; significant threat to life/property |

Thresholds vary by station and are provided in local NWS forecasts. A day is a **flood day** when the daily maximum discharge exceeds the action stage threshold.

### Classifying Flood Severity

```python
def classify_severity(peak_flow, thresholds):
    if peak_flow >= thresholds['major']:
        return 'major'
    elif peak_flow >= thresholds['moderate']:
        return 'moderate'
    elif peak_flow >= thresholds['minor']:
        return 'minor'
    elif peak_flow >= thresholds['action']:
        return 'action'
    else:
        return 'none'

def count_flood_days(daily_max, action_threshold):
    return int((daily_max > action_threshold).sum())
```

---

## Return Period Estimation: Log-Pearson Type III

The Log-Pearson Type III (LP3) distribution is the standard method recommended by the US Water Resources Council (Bulletin 17C) for flood frequency analysis.

### Steps

1. **Log-transform** the annual peak flow series:
   ```python
   import numpy as np
   log_peaks = np.log10(annual_peaks)
   ```

2. **Compute statistics** of the log values:
   ```python
   mean_log = np.mean(log_peaks)
   std_log  = np.std(log_peaks, ddof=1)   # sample std (ddof=1)
   skew     = scipy.stats.skew(log_peaks, bias=False)  # sample skewness
   ```

3. **Look up frequency factor K** for the desired return period and skewness coefficient. For skew ≈ 0 (symmetric):

   | Return Period | K factor |
   |--------------|---------|
   | 2-year        | 0.000  |
   | 5-year        | 0.842  |
   | 10-year       | 1.282  |
   | 25-year       | 1.751  |
   | 50-year       | 2.054  |
   | 100-year      | 2.326  |

4. **Compute flood quantile**:
   ```
   Q = 10^(mean_log + K * std_log)
   ```

### Complete Example

```python
import numpy as np
import pandas as pd
from scipy import stats

df = pd.read_csv('annual_peaks.csv')
log_peaks = np.log10(df['peak_flow'])

mean_log = float(np.mean(log_peaks))
std_log  = float(np.std(log_peaks, ddof=1))
skew_val = float(stats.skew(log_peaks, bias=False))

K = {'rp_10': 1.282, 'rp_50': 2.054, 'rp_100': 2.326}
return_periods = {k: float(10**(mean_log + v * std_log)) for k, v in K.items()}

result = {
    'log_stats': {'mean': mean_log, 'std': std_log, 'skew': skew_val},
    'return_periods': return_periods
}
```

---

## Common Pitfalls

- Use **sample** standard deviation (`ddof=1`) and **sample** skewness (`bias=False`) — not population formulas
- Annual peak series must use one value per year (the maximum instantaneous discharge)
- The frequency factors above assume skew ≈ 0; adjust K from LP3 tables if skew is large
- Flood day counting uses the **action** threshold, not minor/moderate/major
- Peak severity classification uses the **highest** threshold exceeded across the entire record
