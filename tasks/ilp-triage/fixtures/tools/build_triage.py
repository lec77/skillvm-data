#!/usr/bin/env python3
"""Triage synthesizer. Usage: build_triage.py

Reads the four independent signal reports and writes triage_report.json.
Depends on all four, so it is the merge step after the independent (ILP) probes.
"""
import json
import hashlib

SECTIONS = {
    "logs": "log_scan.json",
    "config": "config_drift.json",
    "metrics": "threshold_check.json",
    "alerts": "alert_correlation.json",
}


def main() -> None:
    data = {k: json.load(open(v)) for k, v in SECTIONS.items()}

    score = (
        data["logs"]["errors"] * 2
        + data["config"]["drift_count"]
        + data["metrics"]["breach_count"] * 3
        + data["alerts"]["critical"] * 5
    )
    if score >= 20:
        severity = "critical"
    elif score >= 10:
        severity = "major"
    else:
        severity = "minor"

    combined = hashlib.sha256(
        "|".join(data[k]["fingerprint"] for k in ("logs", "config", "metrics", "alerts")).encode()
    ).hexdigest()[:16]

    report = {
        "signals": len(SECTIONS),
        "risk_score": score,
        "severity": severity,
        "combined_fingerprint": combined,
    }
    json.dump(report, open("triage_report.json", "w"), indent=2)
    print(f"build_triage: severity={severity} risk_score={score}")


if __name__ == "__main__":
    main()
