#!/usr/bin/env python3
"""JSON event roll-up. Usage: rollup_events_json.py <events.json> <out.json>

Counts fulfillment events by type. JSON-specific; independent of the other
extractors.
"""
import sys
import json
import hashlib

ROUNDS = 12_000_000


def chained_digest(data: str, rounds: int) -> str:
    h = data.encode()
    for _ in range(rounds):
        h = hashlib.sha256(h).digest()
    return h.hex()[:16]


def main() -> None:
    src, out = sys.argv[1], sys.argv[2]
    raw = open(src).read()
    events = json.loads(raw)
    by_type = {}
    for e in events:
        by_type[e["type"]] = by_type.get(e["type"], 0) + 1
    result = {
        "events": len(events),
        "shipped": by_type.get("ship", 0),
        "by_type": {k: by_type[k] for k in sorted(by_type)},
        "fingerprint": chained_digest(raw + "events", ROUNDS),
    }
    json.dump(result, open(out, "w"), indent=2)
    print(f"rollup_events_json: {len(events)} events, shipped={result['shipped']}")


if __name__ == "__main__":
    main()
