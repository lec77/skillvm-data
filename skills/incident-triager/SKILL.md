---
name: incident-triager
description: Gather four independent incident signals, then synthesize a triage verdict
---

## When to Use

Use this skill during an incident to gather four independent signals — log error
rates, config drift, metric threshold breaches, and alert correlation — and
synthesize a single triage report with a severity verdict.

## Why the Probes Are Independent

Each signal comes from a different source and needs a different tool. None of the
four probes reads another's output, so they are independent instructions: they
can be issued together and run at the same time. Only the final triage depends on
all four.

## Workflow

### Step 1 — Scan the logs

```bash
python3 tools/scan_logs.py signals/logs log_scan.json
```

### Step 2 — Detect config drift

```bash
python3 tools/diff_config.py signals/baseline.conf signals/current.conf config_drift.json
```

### Step 3 — Check metric thresholds

```bash
python3 tools/check_thresholds.py signals/metrics.json threshold_check.json
```

### Step 4 — Correlate alerts

```bash
python3 tools/correlate_alerts.py signals/alerts.json alert_correlation.json
```

Steps 1–4 are independent — each reads its own signal source and writes its own
report, and none consumes another's result. They may run in any order or
concurrently.

### Step 5 — Synthesize the triage verdict

Once all four signal reports exist, merge them:

```bash
python3 tools/build_triage.py
```

This reads `log_scan.json`, `config_drift.json`, `threshold_check.json`, and
`alert_correlation.json` and writes `triage_report.json`.
