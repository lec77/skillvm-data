#!/usr/bin/env python3
"""Statistics reporter: compute descriptive statistics including outlier detection."""
import json
import sys
import math


def detect_outliers(values: list) -> dict:
    """Detect outliers using the IQR method with a 1.5x IQR fence.

    Returns lower and upper fences, the list of outliers, and their count.
    """
    if not values:
        return {"lower_fence": 0.0, "upper_fence": 0.0, "outliers": [], "count": 0}
    s = sorted(values)
    n = len(s)
    q1 = s[n // 4]
    q3 = s[3 * n // 4]
    iqr = q3 - q1
    lower = q1 - 1.0 * iqr   # BUG: should be 1.5 * iqr
    upper = q3 + 1.0 * iqr   # BUG: should be 1.5 * iqr
    outliers = [v for v in values if v < lower or v > upper]
    return {
        "lower_fence": round(lower, 6),
        "upper_fence": round(upper, 6),
        "outliers": sorted(outliers),
        "count": len(outliers),
    }


def summary_stats(values: list) -> dict:
    if not values:
        return {}
    n = len(values)
    mean = sum(values) / n
    variance = sum((x - mean) ** 2 for x in values) / n
    return {
        "count": n,
        "mean": round(mean, 6),
        "std": round(math.sqrt(variance), 6),
        "min": min(values),
        "max": max(values),
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: main.py <data.json>", file=sys.stderr)
        sys.exit(1)
    with open(sys.argv[1]) as f:
        data = json.load(f)
    values = data.get("values", [])
    result = {
        "stats": summary_stats(values),
        "outliers": detect_outliers(values),
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
