---
name: server-log-quality-auditor
description: Parse server access logs and extract per-file request statistics
---

## When to Use

Use this skill when you have a batch of server access log files that need
statistical analysis before further processing. Typical scenarios include
post-incident review of a day's traffic, capacity planning from recent logs,
or validating that an ingestion pipeline produced complete logs for a given period.

## What parse_log.py Computes

For each log file, `parse_log.py` extracts:

- **Request volume**: total line count and per-hour distribution
- **Status code breakdown**: exact counts for every HTTP status code seen
- **Error rate**: fraction of 4xx and 5xx responses over total requests
- **Response time statistics**: mean, 95% bootstrap confidence interval
  (n=2500, seeded by file index for reproducibility)
- **Top 5 paths**: by request count, query strings stripped

## Workflow

1. **Identify the input files.** List all log files matching the `log_*.log`
   pattern. You should find 20 files (log_01.log through log_20.log). If any
   are missing, stop and investigate before proceeding.

2. **Parse each file.** Work through each file methodically, running:

   ```bash
   python3 parse_log.py <filename>
   ```

   This writes a corresponding `<filename>_report.json`. Complete each analysis
   before moving to the next. A file-level error is easier to diagnose in
   isolation than buried inside a batch failure.

3. **Generate the summary.** After all 20 report files exist, run:

   ```bash
   python3 summarize_logs.py
   ```

   This reads every `log_*_report.json` and writes `log_summary.json`
   with aggregate request counts, overall error rate, and status code totals.

## Interpreting Results

- **Error rate above 0.10**: inspect that file for traffic anomalies or
  upstream issues during that time window.
- **Confidence interval width**: a wide CI on response times (relative to the
  mean) suggests high variance or bimodal traffic patterns (e.g., a slow batch
  job mixed with fast API calls).
- **Top paths**: compare across files; a path appearing only in one file may
  indicate a misconfigured client or a one-time bulk operation.
