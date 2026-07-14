---
name: flood-analysis
description: Analyze streamflow data for flood risk assessment. Use when processing USGS water data, detecting flood events, computing return periods, or classifying flood severity.
---

# Flood Analysis

## Task 1: Flood Risk Assessment

Given daily streamflow CSV and thresholds JSON, produce a flood report.

### Severity Classification

Compare each station's **peak flow** (maximum value across all days) against thresholds. Check from highest to lowest:

```
if peak_flow >= major → "major"
else if peak_flow >= moderate → "moderate"
else if peak_flow >= minor → "minor"
else if peak_flow >= action → "action"
else → "none"
```

### Flood Day Counting

A flood day is any day where the flow value is **strictly greater than** the action threshold:

```
flood_days = count of days where flow > action_threshold
```

### Output Format: flood_report.json

```json
{
  "stations": [
    {
      "name": "station_A",
      "max_severity": "moderate",
      "flood_days": 2,
      "peak_flow": 2800,
      "peak_date": "2024-07-18"
    }
  ]
}
```

Use the exact column names from the CSV as station names (e.g., "station_A", "station_B", "station_C").

## Task 2: Log-Pearson Type III Return Periods

Given annual peak flow CSV, fit LP3 distribution and estimate return period flows.

### Step-by-Step Algorithm

1. Read peak_flow column from CSV
2. Compute log10 of each peak flow value
3. Compute sample statistics of the log values:
   - mean: arithmetic mean of log values
   - std: sample standard deviation with ddof=1 (divide by N-1, not N)
   - skew: sample skewness with bias=False (Fisher's definition)
4. Apply frequency factors for skew ≈ 0:
   - K_10 = 1.282 (10-year return period)
   - K_50 = 2.054 (50-year return period)
   - K_100 = 2.326 (100-year return period)
5. Compute flow quantiles: Q = 10^(mean_log + K * std_log)

### Output Format: return_periods.json

```json
{
  "log_stats": {
    "mean": 2.95,
    "std": 0.2034,
    "skew": 0.0
  },
  "return_periods": {
    "rp_10": 1625,
    "rp_50": 2332,
    "rp_100": 2649
  }
}
```

## Critical Rules

- Use **sample** standard deviation (ddof=1, divide by N-1) — NOT population std
- Use **sample** skewness (bias=False) — NOT population skewness
- Flood days: strictly greater than action threshold (>), not >=
- Severity: use >= comparison against thresholds
- Station names must match CSV column headers exactly
- Return period keys must be exactly: rp_10, rp_50, rp_100
