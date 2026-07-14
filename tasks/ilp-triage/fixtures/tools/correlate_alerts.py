#!/usr/bin/env python3
"""Alert correlator. Usage: correlate_alerts.py <alerts.json> <out.json>

Groups the alert stream by service and counts critical alerts. Independent of
the log, config, and metric tools.
"""
import sys
import json
import hashlib

ROUNDS = 13_000_000


def chained_digest(data: str, rounds: int) -> str:
    h = data.encode()
    for _ in range(rounds):
        h = hashlib.sha256(h).digest()
    return h.hex()[:16]


def main() -> None:
    src, out = sys.argv[1], sys.argv[2]
    raw = open(src).read()
    alerts = json.loads(raw)
    by_service = {}
    critical = 0
    for a in alerts:
        by_service.setdefault(a["service"], 0)
        by_service[a["service"]] += 1
        if a["severity"] == "critical":
            critical += 1
    result = {
        "alerts": len(alerts),
        "critical": critical,
        "services_affected": sorted(by_service),
        "fingerprint": chained_digest(raw + "alerts", ROUNDS),
    }
    json.dump(result, open(out, "w"), indent=2)
    print(f"correlate_alerts: {critical} critical across {len(by_service)} service(s)")


if __name__ == "__main__":
    main()
