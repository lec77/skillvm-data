#!/usr/bin/env python3
"""Secret scanner. Usage: scan_secrets.py <service_dir> <out.json>

Walks every .py file under <service_dir> and flags hardcoded secret-like
literals. CPU-bound: the fingerprint chains SHA-256 over the concatenated
source, proving the whole scan ran.
"""
import sys
import os
import re
import json
import hashlib

ROUNDS = 11_000_000  # ~2.7 s on M4; keeps the step meaningfully CPU-bound

SECRET_PATTERNS = [
    re.compile(r"sk_live_[A-Za-z0-9]{16,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"(?i)api[_-]?token\s*=\s*['\"]"),
    re.compile(r"(?i)aws[_-]?key\s*=\s*['\"]"),
]


def chained_digest(data: str, rounds: int) -> str:
    h = data.encode()
    for _ in range(rounds):
        h = hashlib.sha256(h).digest()
    return h.hex()[:16]


def main() -> None:
    service_dir, out_path = sys.argv[1], sys.argv[2]
    corpus = []
    findings = []
    for root, _dirs, files in os.walk(service_dir):
        for fname in sorted(files):
            if not fname.endswith(".py"):
                continue
            fpath = os.path.join(root, fname)
            with open(fpath) as fh:
                source = fh.read()
            corpus.append(source)
            for pat in SECRET_PATTERNS:
                for _m in pat.finditer(source):
                    findings.append(fname)
    result = {
        "files_scanned": len([f for r, _d, fs in os.walk(service_dir) for f in fs if f.endswith(".py")]),
        "findings": len(findings),
        "flagged_files": sorted(set(findings)),
        "fingerprint": chained_digest("".join(sorted(corpus)) + "secrets", ROUNDS),
    }
    with open(out_path, "w") as fh:
        json.dump(result, fh, indent=2)
    print(f"scan_secrets: {result['findings']} finding(s) in {result['files_scanned']} file(s)")


if __name__ == "__main__":
    main()
