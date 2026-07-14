#!/usr/bin/env python3
"""Aggregate all log_*_report.json files into log_summary.json."""
import json
import glob
import os


def main():
    reports = sorted(glob.glob("log_*_report.json"))
    if not reports:
        raise SystemExit("No log reports found. Run parse_log.py on each log file first.")

    total_requests = 0
    total_errors = 0
    all_statuses = {}

    for rp in reports:
        with open(rp) as f:
            r = json.load(f)
        total_requests += r["total_requests"]
        total_errors += round(r["error_rate"] * r["total_requests"])
        for k, v in r["status_codes"].items():
            all_statuses[k] = all_statuses.get(k, 0) + v

    summary = {
        "files_processed": len(reports),
        "total_requests": total_requests,
        "overall_error_rate": round(total_errors / total_requests, 6) if total_requests else 0,
        "aggregate_status_codes": dict(sorted(all_statuses.items())),
    }
    with open("log_summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    print(f"Wrote log_summary.json ({len(reports)} files, {total_requests} total requests)")


if __name__ == "__main__":
    main()
