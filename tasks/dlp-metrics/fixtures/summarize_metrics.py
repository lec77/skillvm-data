#!/usr/bin/env python3
"""Read all *_profile.json files and produce metrics_summary.json."""
import json
import glob
import os


def main():
    reports = sorted(glob.glob("metrics_*_profile.json"))
    if not reports:
        print("No profile files found")
        return

    cpu_means = []
    mem_means = []
    disk_means = []
    net_means = []
    peak_cpu_files = []

    for rpath in reports:
        with open(rpath) as f:
            r = json.load(f)
        cols = r["columns"]
        cpu_m = cols["cpu_percent"]["mean"]
        cpu_means.append(cpu_m)
        mem_means.append(cols["mem_percent"]["mean"])
        disk_means.append(cols["disk_percent"]["mean"])
        net_means.append(cols["net_mbps"]["mean"])
        if cpu_m > 80.0:
            peak_cpu_files.append(r["file"])

    summary = {
        "total_files": len(reports),
        "avg_cpu_mean": round(sum(cpu_means) / len(cpu_means), 6),
        "avg_mem_mean": round(sum(mem_means) / len(mem_means), 6),
        "avg_disk_mean": round(sum(disk_means) / len(disk_means), 6),
        "avg_net_mean": round(sum(net_means) / len(net_means), 6),
        "peak_cpu_files": sorted(peak_cpu_files),
    }

    with open("metrics_summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    print(f"Wrote metrics_summary.json ({len(reports)} files, "
          f"{len(peak_cpu_files)} with peak CPU>80%)")


if __name__ == "__main__":
    main()
