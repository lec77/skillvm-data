---
name: flood-analysis
description: Analyze streamflow data for flood risk assessment. Use when processing water data, detecting flood events, computing return periods, or classifying flood severity.
---

# Flood Analysis

CRITICAL: CSV data files can have hundreds of rows. Do NOT try to read them with the read tool — the output will be truncated and you will miss data. Instead, ALWAYS:
1. Write a Python script to a .py file using the write tool
2. Execute it using the exec tool with `python3 script.py`
3. The script reads the CSV and writes the JSON output file

## Task 1: Flood Event Detection

Given streamflow CSV + thresholds JSON → write `flood_report.json`.

### Step 1: Write this script to `flood_analysis.py`

```python
import json
import csv

with open('streamflow.csv') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

with open('thresholds.json') as f:
    thresholds = json.load(f)

station_names = [col for col in rows[0].keys() if col != 'date']

stations = []
for station in station_names:
    thresh = thresholds[station]
    flows = [(row['date'], int(row[station])) for row in rows]
    peak_flow = max(f for _, f in flows)
    peak_date = [d for d, f in flows if f == peak_flow][0]
    flood_days = sum(1 for _, f in flows if f > thresh['action'])
    if peak_flow >= thresh['major']:
        severity = 'major'
    elif peak_flow >= thresh['moderate']:
        severity = 'moderate'
    elif peak_flow >= thresh['minor']:
        severity = 'minor'
    elif peak_flow >= thresh['action']:
        severity = 'action'
    else:
        severity = 'none'
    stations.append({
        'name': station,
        'max_severity': severity,
        'flood_days': flood_days,
        'peak_flow': peak_flow,
        'peak_date': peak_date
    })

with open('flood_report.json', 'w') as f:
    json.dump({'stations': stations}, f, indent=2)
print("Done")
```

### Step 2: Execute it

Use the exec tool: `python3 flood_analysis.py`

### Output format

```json
{"stations": [{"name": "station_X", "max_severity": "moderate", "flood_days": 2, "peak_flow": 2800, "peak_date": "2024-07-18"}]}
```

### Rules
- flood_day: flow **strictly greater than** `action` threshold
- max_severity: check peak_flow against major/moderate/minor/action from highest to lowest
- peak_flow: maximum daily flow for that station
- peak_date: date (YYYY-MM-DD) of the peak_flow

---

## Task 2: Log-Pearson Type III Return Periods

Given `annual_peaks.csv` → write `return_periods.json`.

### Step 1: Write this script to `log_pearson.py`

```python
import json
import csv
import math

with open('annual_peaks.csv') as f:
    reader = csv.DictReader(f)
    peaks = [int(row['peak_flow']) for row in reader]

log_peaks = [math.log10(p) for p in peaks]
n = len(log_peaks)
mean_log = sum(log_peaks) / n
std_log = (sum((x - mean_log) ** 2 for x in log_peaks) / (n - 1)) ** 0.5
m3 = sum((x - mean_log) ** 3 for x in log_peaks) / n
pop_std = (sum((x - mean_log) ** 2 for x in log_peaks) / n) ** 0.5
skew = (m3 / (pop_std ** 3)) * (n * n) / ((n - 1) * (n - 2))

K = {'rp_10': 1.282, 'rp_50': 2.054, 'rp_100': 2.326}
return_periods = {}
for k, v in K.items():
    return_periods[k] = round(10 ** (mean_log + v * std_log), 1)

result = {
    'log_stats': {'mean': round(mean_log, 4), 'std': round(std_log, 4), 'skew': round(skew, 4)},
    'return_periods': return_periods
}

with open('return_periods.json', 'w') as f:
    json.dump(result, f, indent=2)
print("Done")
```

### Step 2: Execute it

Use the exec tool: `python3 log_pearson.py`

### Output format

```json
{"log_stats": {"mean": 2.95, "std": 0.2, "skew": 0.0}, "return_periods": {"rp_10": 1625, "rp_50": 2332, "rp_100": 2649}}
```

### Rules
- Use sample std (ddof=1) and sample skewness (Fisher's formula)
- Frequency factors for skew≈0: K_10=1.282, K_50=2.054, K_100=2.326
- Q = 10^(mean_log + K * std_log)
