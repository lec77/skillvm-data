#!/usr/bin/env python3
"""Release readiness synthesizer. Usage: build_report.py

Reads the four section reports produced by the analyzers and writes
release_report.json. Depends on all four, so it is the merge step after the
independent (ILP) analyses complete.
"""
import json
import hashlib

SECTIONS = {
    "secrets": "secrets_scan.json",
    "complexity": "complexity_metrics.json",
    "deps": "dep_audit.json",
    "perf": "perf_probe.json",
}


def main() -> None:
    reports = {}
    for key, path in SECTIONS.items():
        with open(path) as fh:
            reports[key] = json.load(fh)

    blockers = []
    if reports["secrets"]["findings"] > 0:
        blockers.append("hardcoded-secrets")
    if reports["deps"]["vulnerable_count"] > 0:
        blockers.append("vulnerable-dependencies")
    if reports["complexity"]["avg_branches"] > 5.0:
        blockers.append("high-complexity")

    # Combined fingerprint chains the four section fingerprints in a fixed order,
    # so the report can only be correct if every analyzer actually ran.
    combined = hashlib.sha256(
        "|".join(reports[k]["fingerprint"] for k in ("secrets", "complexity", "deps", "perf")).encode()
    ).hexdigest()[:16]

    report = {
        "ready": len(blockers) == 0,
        "blockers": sorted(blockers),
        "sections": {k: SECTIONS[k] for k in SECTIONS},
        "combined_fingerprint": combined,
    }
    with open("release_report.json", "w") as fh:
        json.dump(report, fh, indent=2)
    print(f"build_report: ready={report['ready']} blockers={report['blockers']}")


if __name__ == "__main__":
    main()
