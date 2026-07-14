#!/usr/bin/env python3
"""Profile a system metrics CSV file with bootstrap CI and Pearson correlations.
CPU-bound (bootstrap) to give ~20 s per file on M4."""
import sys
import os
import json
import csv
import random
import math
import re

BOOTSTRAP_N = 3000  # ~20 s per file on M4 (4 cols × 500 rows)


def load_csv(filepath: str):
    with open(filepath) as f:
        reader = csv.reader(f)
        header = next(reader)
        data = []
        for row in reader:
            # timestamp is index 0 (string), rest are floats
            data.append([row[0]] + [float(x) for x in row[1:]])
    return header, data


def mean(vals):
    return sum(vals) / len(vals)


def stdev(vals):
    m = mean(vals)
    return math.sqrt(sum((x - m) ** 2 for x in vals) / len(vals))


def percentile(vals, p):
    s = sorted(vals)
    return s[int(p * len(s))]


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


def pearson(x, y):
    mx, my = mean(x), mean(y)
    num = sum((xi - mx) * (yi - my) for xi, yi in zip(x, y))
    dx = math.sqrt(sum((xi - mx) ** 2 for xi in x))
    dy = math.sqrt(sum((yi - my) ** 2 for yi in y))
    return round(num / (dx * dy), 6) if dx and dy else 0.0


def analyze(filepath: str) -> dict:
    header, data = load_csv(filepath)
    num_headers = header[1:]  # cpu_percent, mem_percent, disk_percent, net_mbps
    cols = {h: [row[i + 1] for row in data] for i, h in enumerate(num_headers)}

    basename = os.path.basename(filepath)
    file_idx = int(re.search(r"\d+", basename).group())
    seed_base = 42 + file_idx * 1000

    col_results = {}
    for j, name in enumerate(num_headers):
        v = cols[name]
        ci_lo, ci_hi = bootstrap_ci(v, seed=seed_base + j)
        col_results[name] = {
            "mean": round(mean(v), 6),
            "std": round(stdev(v), 6),
            "p95": round(percentile(v, 0.95), 6),
            "p99": round(percentile(v, 0.99), 6),
            "ci_lower": round(ci_lo, 6),
            "ci_upper": round(ci_hi, 6),
        }

    corr = {}
    for i in range(len(num_headers)):
        for j in range(i + 1, len(num_headers)):
            key = f"{num_headers[i]}_vs_{num_headers[j]}"
            corr[key] = pearson(cols[num_headers[i]], cols[num_headers[j]])

    return {
        "file": basename,
        "n_rows": len(data),
        "columns": col_results,
        "correlations": corr,
    }


if __name__ == "__main__":
    fp = sys.argv[1]
    result = analyze(fp)
    out = fp.rsplit(".", 1)[0] + "_profile.json"
    with open(out, "w") as f:
        json.dump(result, f, indent=2)
    print(f"Wrote {out}")
