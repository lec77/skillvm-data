#!/usr/bin/env python3
"""Bootstrap statistical analysis for a single CSV file.
Pure Python loops (no numpy) to ensure CPU-bound ~3-5s per file."""
import sys
import os
import json
import csv
import random
import math

BOOTSTRAP_N = 2500  # Tuned: 500→4s, 2500→~20s per file on M4


def load_csv(filepath):
    with open(filepath) as f:
        reader = csv.reader(f)
        header = next(reader)
        data = [[float(x) for x in row] for row in reader]
    return header, data


def mean(vals):
    return sum(vals) / len(vals)


def stdev(vals):
    m = mean(vals)
    return math.sqrt(sum((x - m) ** 2 for x in vals) / len(vals))


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


def outliers_iqr(vals):
    s = sorted(vals)
    n = len(s)
    q1 = s[n // 4]
    q3 = s[3 * n // 4]
    iqr = q3 - q1
    lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    return sum(1 for x in vals if x < lo or x > hi)


def pearson(x, y):
    mx, my = mean(x), mean(y)
    num = sum((xi - mx) * (yi - my) for xi, yi in zip(x, y))
    dx = math.sqrt(sum((xi - mx) ** 2 for xi in x))
    dy = math.sqrt(sum((yi - my) ** 2 for yi in y))
    return round(num / (dx * dy), 6) if dx and dy else 0.0


def analyze(filepath):
    header, data = load_csv(filepath)
    ncols = len(header)
    cols = [[row[j] for row in data] for j in range(ncols)]
    basename = os.path.basename(filepath)
    file_idx = int(basename.split("_")[1].split(".")[0])
    seed_base = 42 + file_idx * 1000

    col_results = {}
    for j, name in enumerate(header):
        v = cols[j]
        ci_lo, ci_hi = bootstrap_ci(v, seed=seed_base + j)
        col_results[name] = {
            "mean": round(mean(v), 6),
            "std": round(stdev(v), 6),
            "ci_lower": round(ci_lo, 6),
            "ci_upper": round(ci_hi, 6),
            "outlier_count": outliers_iqr(v),
        }

    corr = {}
    for i in range(ncols):
        for j in range(i + 1, ncols):
            corr[f"{header[i]}_vs_{header[j]}"] = pearson(cols[i], cols[j])

    return {
        "file": basename,
        "n_rows": len(data),
        "columns": col_results,
        "correlations": corr,
    }


if __name__ == "__main__":
    fp = sys.argv[1]
    result = analyze(fp)
    out = fp.rsplit(".", 1)[0] + "_report.json"
    with open(out, "w") as f:
        json.dump(result, f, indent=2)
    print(f"Wrote {out}")
