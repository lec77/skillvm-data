#!/usr/bin/env python3
"""CSV order parser. Usage: parse_orders_csv.py <orders.csv> <out.json>

Parses the comma-separated order file and totals revenue per SKU. CSV-specific
logic; independent of the JSON/fixed-width/XML parsers.
"""
import sys
import csv
import json
import hashlib

ROUNDS = 11_000_000


def chained_digest(data: str, rounds: int) -> str:
    h = data.encode()
    for _ in range(rounds):
        h = hashlib.sha256(h).digest()
    return h.hex()[:16]


def main() -> None:
    src, out = sys.argv[1], sys.argv[2]
    raw = open(src).read()
    rows = list(csv.DictReader(raw.splitlines()))
    revenue = 0.0
    per_sku = {}
    for r in rows:
        amt = int(r["qty"]) * float(r["unit_price"])
        revenue += amt
        per_sku[r["sku"]] = round(per_sku.get(r["sku"], 0.0) + amt, 2)
    result = {
        "orders": len(rows),
        "revenue": round(revenue, 2),
        "per_sku": {k: per_sku[k] for k in sorted(per_sku)},
        "fingerprint": chained_digest(raw + "orders", ROUNDS),
    }
    json.dump(result, open(out, "w"), indent=2)
    print(f"parse_orders_csv: {len(rows)} orders, revenue={result['revenue']}")


if __name__ == "__main__":
    main()
