#!/usr/bin/env python3
"""Config drift detector. Usage: diff_config.py <baseline.conf> <current.conf> <out.json>

Takes TWO input files and reports keys whose values drifted. A different
argument shape from the other tools.
"""
import sys
import json
import hashlib

ROUNDS = 10_000_000


def chained_digest(data: str, rounds: int) -> str:
    h = data.encode()
    for _ in range(rounds):
        h = hashlib.sha256(h).digest()
    return h.hex()[:16]


def load_conf(path: str) -> dict:
    cfg = {}
    for line in open(path):
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            cfg[k.strip()] = v.strip()
    return cfg


def main() -> None:
    base_path, cur_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
    base, cur = load_conf(base_path), load_conf(cur_path)
    drift = []
    for k in sorted(set(base) | set(cur)):
        if base.get(k) != cur.get(k):
            drift.append({"key": k, "from": base.get(k), "to": cur.get(k)})
    corpus = open(base_path).read() + "\x00" + open(cur_path).read()
    result = {
        "keys_compared": len(set(base) | set(cur)),
        "drift_count": len(drift),
        "drift": drift,
        "fingerprint": chained_digest(corpus + "config", ROUNDS),
    }
    json.dump(result, open(out, "w"), indent=2)
    print(f"diff_config: {len(drift)} drifted key(s)")


if __name__ == "__main__":
    main()
