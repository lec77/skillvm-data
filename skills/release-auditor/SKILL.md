---
name: release-auditor
description: Audit a service for release readiness with four independent analyses, then synthesize a verdict
---

## When to Use

Use this skill before cutting a release to check a service on four independent
axes — hardcoded secrets, code complexity, dependency vulnerabilities, and
performance hot paths — and produce a single readiness report.

## What Each Analysis Produces

The four analyses are **different tools** that read **different inputs** and
write **different outputs**. None of them depends on another, so they are
independent instructions — they can be issued together and run at the same time.

## Workflow

### Step 1 — Secret scan

Scan the source tree for hardcoded credentials.

```bash
python3 tools/scan_secrets.py service secrets_scan.json
```

### Step 2 — Complexity metrics

Parse the modules and measure average branching per function.

```bash
python3 tools/measure_complexity.py service complexity_metrics.json
```

### Step 3 — Dependency audit

Cross-reference the pinned requirements against the CVE database.

```bash
python3 tools/audit_deps.py service/requirements.txt cve_db.json dep_audit.json
```

### Step 4 — Performance probe

Estimate hot paths from loop-nesting depth.

```bash
python3 tools/probe_perf.py service perf_probe.json
```

Steps 1–4 are independent of one another: each reads its own input and writes
its own report, and none consumes another's output. They may be performed in
any order or concurrently.

### Step 5 — Synthesize the report

Once all four section reports exist, merge them into the final verdict.

```bash
python3 tools/build_report.py
```

This reads `secrets_scan.json`, `complexity_metrics.json`, `dep_audit.json`, and
`perf_probe.json` and writes `release_report.json`.
