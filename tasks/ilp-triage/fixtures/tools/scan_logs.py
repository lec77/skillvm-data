#!/usr/bin/env python3
"""Log scanner. Usage: scan_logs.py <logs_dir> <out.json>

Counts log lines by level across every *.log file. Independent of the config,
metrics, and alert tools.
"""
import sys
import os
import json
import hashlib

ROUNDS = 11_000_000
LEVELS = ("ERROR", "WARN", "INFO")


def chained_digest(data: str, rounds: int) -> str:
    h = data.encode()
    for _ in range(rounds):
        h = hashlib.sha256(h).digest()
    return h.hex()[:16]


def main() -> None:
    logs_dir, out = sys.argv[1], sys.argv[2]
    counts = {lvl: 0 for lvl in LEVELS}
    corpus = []
    for fname in sorted(os.listdir(logs_dir)):
        if not fname.endswith(".log"):
            continue
        text = open(os.path.join(logs_dir, fname)).read()
        corpus.append(text)
        for line in text.splitlines():
            for lvl in LEVELS:
                if line.startswith(lvl):
                    counts[lvl] += 1
    result = {
        "errors": counts["ERROR"],
        "warnings": counts["WARN"],
        "info": counts["INFO"],
        "fingerprint": chained_digest("".join(sorted(corpus)) + "logs", ROUNDS),
    }
    json.dump(result, open(out, "w"), indent=2)
    print(f"scan_logs: {counts['ERROR']} errors, {counts['WARN']} warnings")


if __name__ == "__main__":
    main()
