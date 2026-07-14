#!/usr/bin/env python3
"""Read all *_report.json files and produce summary.json."""
import json
import glob
import os


def main():
    reports = sorted(glob.glob("data_*_report.json"))
    if not reports:
        print("No report files found")
        return

    per_file_outliers = {}
    all_means = []
    all_ci_lowers = []
    all_ci_uppers = []

    for rpath in reports:
        with open(rpath) as f:
            r = json.load(f)
        fname = r["file"]
        total_outliers = sum(c["outlier_count"] for c in r["columns"].values())
        per_file_outliers[fname] = total_outliers
        for c in r["columns"].values():
            all_means.append(c["mean"])
            all_ci_lowers.append(c["ci_lower"])
            all_ci_uppers.append(c["ci_upper"])

    summary = {
        "total_files_processed": len(reports),
        "per_file_outliers": per_file_outliers,
        "overall_mean": round(sum(all_means) / len(all_means), 6),
        "ci_range": {
            "min_lower": round(min(all_ci_lowers), 6),
            "max_upper": round(max(all_ci_uppers), 6),
        },
    }

    with open("summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    print(f"Wrote summary.json ({len(reports)} files)")


if __name__ == "__main__":
    main()
