#!/usr/bin/env python3
"""Parse a single server access log and compute request statistics.
Uses CPU-bound bootstrap on response times to give ~20-25s per file on M4."""
import sys
import os
import json
import re
import random
import math

BOOTSTRAP_N = 14000  # Tuned: 14k rounds × 2000 entries ≈ 20s per file on M4

# Format: <IP> [<DATE> <TIME>] "<METHOD> <PATH>" <STATUS> <BYTES> <MS>
LOG_RE = re.compile(
    r'(\S+) \[(\d{4}-\d{2}-\d{2}) (\d{2}):\d{2}:\d{2}\] '
    r'"(\S+) ([^\s"]+)[^"]*" (\d{3}) \d+ (\d+)'
)


def bootstrap_ci(vals, seed, n=BOOTSTRAP_N):
    rng = random.Random(seed)
    length = len(vals)
    means = []
    for _ in range(n):
        s = 0.0
        for _ in range(length):
            s += vals[rng.randint(0, length - 1)]
        means.append(s / length)
    means.sort()
    return means[int(n * 0.025)], means[int(n * 0.975)]


def mean(vals):
    return sum(vals) / len(vals)


def parse(filepath):
    statuses = {}
    paths = {}
    hours = {}
    response_times = []

    with open(filepath) as f:
        for line in f:
            m = LOG_RE.match(line.strip())
            if not m:
                continue
            _ip, _date, hour, _method, path, status, ms_str = m.groups()
            path = path.split("?")[0]
            ms = int(ms_str)
            statuses[status] = statuses.get(status, 0) + 1
            paths[path] = paths.get(path, 0) + 1
            hours[hour] = hours.get(hour, 0) + 1
            response_times.append(ms)

    total = len(response_times)
    if total == 0:
        raise ValueError(f"No log entries parsed from {filepath}")

    errors = sum(v for k, v in statuses.items()
                 if k.startswith("4") or k.startswith("5"))
    avg_ms = round(mean(response_times), 2)

    basename = os.path.basename(filepath)
    file_idx = int(re.search(r"\d+", basename).group())
    ci_lo, ci_hi = bootstrap_ci(response_times, seed=42 + file_idx * 1000)

    top_paths = sorted(paths.items(), key=lambda x: -x[1])[:5]

    return {
        "file": basename,
        "total_requests": total,
        "status_codes": dict(sorted(statuses.items())),
        "error_rate": round(errors / total, 6),
        "avg_response_ms": avg_ms,
        "response_time_ci_lower": round(ci_lo, 2),
        "response_time_ci_upper": round(ci_hi, 2),
        "top_paths": [{"path": p, "count": c} for p, c in top_paths],
        "requests_per_hour": dict(sorted(hours.items())),
    }


if __name__ == "__main__":
    fp = sys.argv[1]
    result = parse(fp)
    out = fp.rsplit(".", 1)[0] + "_report.json"
    with open(out, "w") as f:
        json.dump(result, f, indent=2)
    print(f"Wrote {out}")
