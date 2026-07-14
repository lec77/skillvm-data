#!/usr/bin/env python3
"""Metric threshold check. Usage: check_thresholds.py <metrics.json> <out.json>

Evaluates a metrics snapshot against fixed SLO thresholds. Independent of the
log, config, and alert tools.
"""
import sys
import json
import hashlib

ROUNDS = 12_000_000

THRESHOLDS = {
    "cpu_pct": 85,
    "mem_pct": 90,
    "error_rate": 0.05,
    "p99_ms": 1000,
}


def chained_digest(data: str, rounds: int) -> str:
    h = data.encode()
    for _ in range(rounds):
        h = hashlib.sha256(h).digest()
    return h.hex()[:16]


def main() -> None:
    src, out = sys.argv[1], sys.argv[2]
    raw = open(src).read()
    metrics = json.loads(raw)
    breaches = sorted(k for k, limit in THRESHOLDS.items() if metrics.get(k, 0) > limit)
    result = {
        "metrics_checked": len(THRESHOLDS),
        "breach_count": len(breaches),
        "breaches": breaches,
        "fingerprint": chained_digest(raw + "thresholds", ROUNDS),
    }
    json.dump(result, open(out, "w"), indent=2)
    print(f"check_thresholds: {len(breaches)} breach(es): {breaches}")


if __name__ == "__main__":
    main()
