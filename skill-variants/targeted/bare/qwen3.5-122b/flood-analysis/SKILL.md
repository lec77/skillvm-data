---
name: flood-analysis
description: Analyze streamflow data for flood risk assessment. Use when processing USGS water data, detecting flood events, computing return periods, or classifying flood severity.
---

# Flood Analysis

## Flood Event Detection

Given daily streamflow CSV and NWS flood thresholds JSON:

1. **Load data**: Read CSV with date column + station columns. Read thresholds JSON with per-station action/minor/moderate/major values.

2. **Count flood days per station**: A flood day is any day where discharge **strictly exceeds** (`>`, not `>=`) the **action** threshold. Use strict greater-than.

3. **Find peak flow per station**: The maximum discharge value across all days.

4. **Classify max severity** using the peak flow:
```python
def classify(peak, thresholds):
    if peak >= thresholds['major']:   return 'major'
    if peak >= thresholds['moderate']: return 'moderate'
    if peak >= thresholds['minor']:   return 'minor'
    if peak >= thresholds['action']:  return 'action'
    return 'none'
```
Note: severity uses `>=` (greater-than-or-equal). Flood day counting uses `>` (strict).

5. **Find peak date**: The date when peak flow occurred.

### Output format — `flood_report.json`
```json
{
  "stations": [
    {"name": "station_A", "max_severity": "moderate", "flood_days": 2, "peak_flow": 2800, "peak_date": "2024-07-18"},
    ...
  ]
}
```
Use station column names from the CSV as-is for `name` field.

## Return Period Estimation (Log-Pearson Type III)

Given annual peak flow CSV with columns `year` and `peak_flow`:

1. **Log-transform**: `log_peaks = log10(peak_flow)` for every row
2. **Statistics** (MUST use sample formulas):
   - `mean_log = mean(log_peaks)`
   - `std_log = std(log_peaks, ddof=1)` — sample std, NOT population
   - `skew = skew(log_peaks, bias=False)` — sample skewness
3. **Frequency factors** (for skew ≈ 0): K_10=1.282, K_50=2.054, K_100=2.326
4. **Flood quantiles**: `Q = 10^(mean_log + K * std_log)`

### Output format — `return_periods.json`
```json
{
  "log_stats": {"mean": 2.95, "std": 0.20, "skew": 0.0},
  "return_periods": {"rp_10": 1625, "rp_50": 2332, "rp_100": 2649}
}
```
All values must be numbers (not strings). Use `float()` to ensure numeric types.

## Critical Rules
- Flood day count: use `>` (strict greater-than) with **action** threshold only
- Severity classification: use `>=` (greater-than-or-equal), check from major down to action
- Always use **sample** statistics: `ddof=1` for std, `bias=False` for skew
- Return period keys must be exactly `rp_10`, `rp_50`, `rp_100`
- Log stats keys must be exactly `mean`, `std`, `skew`
