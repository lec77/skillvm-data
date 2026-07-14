---
name: flood-analysis
description: Analyze streamflow data for flood risk assessment. Use when processing USGS water data, detecting flood events, computing return periods, or classifying flood severity.
---

# Flood Analysis

## Flood Severity Classification

NWS defines four flood stages in ascending order: **action**, **minor**, **moderate**, **major**. Classify by highest threshold exceeded:

```python
def classify_severity(peak_flow, thresholds):
    for level in ['major', 'moderate', 'minor', 'action']:
        if peak_flow >= thresholds[level]:
            return level
    return 'none'
```

**Flood days** = days where daily max discharge **exceeds the action threshold**:
```python
flood_days = int((daily_max > thresholds['action']).sum())
```

## Return Period Estimation: Log-Pearson Type III

Standard method (Bulletin 17C). Steps:

1. `log_peaks = np.log10(annual_peaks)` — one peak per water year
2. Compute **sample** statistics (critical: use `ddof=1` and `bias=False`):
   ```python
   mean_log = np.mean(log_peaks)
   std_log = np.std(log_peaks, ddof=1)
   skew = scipy.stats.skew(log_peaks, bias=False)
   ```
3. Frequency factors (for skew ≈ 0): K_10=1.282, K_50=2.054, K_100=2.326
4. Flood quantile: `Q = 10^(mean_log + K * std_log)`

## Critical Rules

- **Sample** std (`ddof=1`) and **sample** skewness (`bias=False`) — never population formulas
- Flood day counting uses the **action** threshold, not minor/moderate/major
- Severity = **highest** threshold exceeded across the entire record
- Annual peak series: one maximum value per year
