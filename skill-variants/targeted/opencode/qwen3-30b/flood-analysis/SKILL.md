---
name: flood-analysis
description: Analyze streamflow data for flood risk assessment. Use when processing USGS water data, detecting flood events, computing return periods, or classifying flood severity.
---

# Flood Analysis Skill

## CRITICAL RULE

You MUST write a Python script file and execute it with bash to produce results.
Do NOT try to compute results manually or write output JSON directly.
Do NOT use the write/edit tool to create the output JSON — let the script create it.

Workflow: (1) write a .py script file, (2) run it with bash `python3 script.py`, (3) verify the output file exists.

## Flood Event Detection

When given streamflow CSV and thresholds JSON, write and run this script:

```python
import json, csv

with open('thresholds.json') as f:
    thresholds = json.load(f)

with open('streamflow.csv') as f:
    rows = list(csv.DictReader(f))

stations = [k for k in rows[0].keys() if k != 'date']
results = []

for station in stations:
    thresh = thresholds[station]
    flows = [float(row[station]) for row in rows]
    peak_flow = max(flows)
    peak_idx = flows.index(peak_flow)
    peak_date = rows[peak_idx]['date']
    flood_days = sum(1 for f in flows if f > thresh['action'])

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

    results.append({
        'name': station,
        'max_severity': severity,
        'flood_days': flood_days,
        'peak_flow': peak_flow,
        'peak_date': peak_date
    })

with open('flood_report.json', 'w') as f:
    json.dump({'stations': results}, f, indent=2)
```

Rules:
- flood_days = days where flow is strictly greater than the action threshold
- max_severity = highest threshold the peak flow meets or exceeds
- Severity levels: none < action < minor < moderate < major

## Return Period Estimation (Log-Pearson Type III)

When given annual peak flow CSV, write and run this script:

```python
import json, csv, math

with open('annual_peaks.csv') as f:
    peaks = [float(row['peak_flow']) for row in csv.DictReader(f)]

log_peaks = [math.log10(p) for p in peaks]
n = len(log_peaks)
mean_log = sum(log_peaks) / n
std_log = (sum((x - mean_log)**2 for x in log_peaks) / (n - 1)) ** 0.5
skew = (n * sum((x - mean_log)**3 for x in log_peaks)) / ((n-1) * (n-2) * std_log**3)

K = {'rp_10': 1.282, 'rp_50': 2.054, 'rp_100': 2.326}
return_periods = {k: 10 ** (mean_log + v * std_log) for k, v in K.items()}

result = {
    'log_stats': {'mean': mean_log, 'std': std_log, 'skew': skew},
    'return_periods': return_periods
}

with open('return_periods.json', 'w') as f:
    json.dump(result, f, indent=2)
```

Rules:
- Use sample std (ddof=1, divide by n-1) and sample skewness
- Q = 10^(mean_log + K * std_log)
- K factors for skew near 0: K_10=1.282, K_50=2.054, K_100=2.326
