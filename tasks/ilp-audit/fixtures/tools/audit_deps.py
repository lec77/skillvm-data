#!/usr/bin/env python3
"""Dependency vulnerability audit. Usage: audit_deps.py <requirements.txt> <cve_db.json> <out.json>

Takes TWO input files (a manifest and a CVE database) — a different argument
shape from every other tool — and cross-references pinned versions against known
CVEs. Independent of the source-code analyzers.
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


def main() -> None:
    req_path, cve_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
    with open(cve_path) as fh:
        cve_db = json.load(fh)
    pinned = []
    with open(req_path) as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "==" not in line:
                continue
            name, version = line.split("==", 1)
            pinned.append((name.strip(), version.strip()))

    vulnerable = []
    for name, version in pinned:
        cves = cve_db.get(name, {}).get(version, [])
        if cves:
            vulnerable.append({"package": name, "version": version, "cves": cves})

    corpus = "|".join(f"{n}=={v}" for n, v in pinned)
    result = {
        "checked": len(pinned),
        "vulnerable_count": len(vulnerable),
        "vulnerable": sorted(vulnerable, key=lambda d: d["package"]),
        "fingerprint": chained_digest(corpus + "deps", ROUNDS),
    }
    with open(out_path, "w") as fh:
        json.dump(result, fh, indent=2)
    print(f"audit_deps: {len(vulnerable)}/{len(pinned)} dependencies vulnerable")


if __name__ == "__main__":
    main()
