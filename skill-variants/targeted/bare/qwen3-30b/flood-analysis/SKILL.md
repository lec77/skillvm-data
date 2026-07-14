---
name: flood-analysis
description: Analyze streamflow data for flood risk assessment. Use when processing USGS water data, detecting flood events, computing return periods, or classifying flood severity.
---

# Flood Analysis

IMPORTANT: Always use `execute_command` to run Python scripts for ALL computations. Never compute statistics manually. Write a .py file with `write_file`, then run it with `execute_command`.

## Workflow

1. Use `list_directory` to see available files
2. Use `write_file` to create a Python script that reads input files, does all computation, and writes output JSON
3. Use `execute_command` with `python3 <script>.py` to run it

## Task: Flood Event Detection

Given `streamflow.csv` (columns: date, station_A, station_B, station_C) and `thresholds.json` with flood stage thresholds per station, write `flood_report.json`.

Python script to write and run:

```python
import pandas as pd
import json

df = pd.read_csv('streamflow.csv')
with open('thresholds.json') as f:
    thresholds = json.load(f)

stations = []
for col in ['station_A', 'station_B', 'station_C']:
    t = thresholds[col]
    peak_flow = float(df[col].max())
    peak_idx = df[col].idxmax()
    peak_date = df.loc[peak_idx, 'date']
    flood_days = int((df[col] > t['action']).sum())

    if peak_flow >= t['major']:
        sev = 'major'
    elif peak_flow >= t['moderate']:
        sev = 'moderate'
    elif peak_flow >= t['minor']:
        sev = 'minor'
    elif peak_flow >= t['action']:
        sev = 'action'
    else:
        sev = 'none'

    stations.append({
        'name': col,
        'max_severity': sev,
        'flood_days': flood_days,
        'peak_flow': peak_flow,
        'peak_date': peak_date
    })

with open('flood_report.json', 'w') as f:
    json.dump({'stations': stations}, f, indent=2)
print('Done')
```

## Task: Log-Pearson Type III Return Periods

Given `annual_peaks.csv` (columns: year, peak_flow), write `return_periods.json`.

Python script to write and run:

```python
import numpy as np
import json
import csv

peaks = []
with open('annual_peaks.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        peaks.append(float(row['peak_flow']))

log_peaks = [np.log10(p) for p in peaks]
n = len(log_peaks)
mean_log = float(np.mean(log_peaks))
std_log = float(np.std(log_peaks, ddof=1))
mean_diff = [(x - mean_log) for x in log_peaks]
skew = float((n / ((n-1)*(n-2))) * sum(d**3 for d in mean_diff) / (std_log**3))

K = {'rp_10': 1.282, 'rp_50': 2.054, 'rp_100': 2.326}
rp = {}
for k, v in K.items():
    rp[k] = float(10**(mean_log + v * std_log))

result = {
    'log_stats': {'mean': mean_log, 'std': std_log, 'skew': skew},
    'return_periods': rp
}

with open('return_periods.json', 'w') as f:
    json.dump(result, f, indent=2)
print('Done')
```

## Key Rules

- Flood day = daily flow EXCEEDS the action threshold (strictly greater than)
- Severity = highest threshold the peak flow meets or exceeds (check major first, then moderate, minor, action)
- Use sample std (ddof=1) and sample skewness (bias=False) for log statistics
- Q = 10^(mean_log + K * std_log)
