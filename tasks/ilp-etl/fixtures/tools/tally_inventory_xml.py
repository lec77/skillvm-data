#!/usr/bin/env python3
"""XML inventory tally. Usage: tally_inventory_xml.py <inventory.xml> <out.json>

Parses the XML inventory and sums stock. XML-specific (ElementTree); independent
of the CSV/JSON/fixed-width tools.
"""
import sys
import json
import hashlib
import xml.etree.ElementTree as ET

ROUNDS = 13_000_000


def chained_digest(data: str, rounds: int) -> str:
    h = data.encode()
    for _ in range(rounds):
        h = hashlib.sha256(h).digest()
    return h.hex()[:16]


def main() -> None:
    src, out = sys.argv[1], sys.argv[2]
    raw = open(src).read()
    root = ET.fromstring(raw)
    per_sku = {}
    total = 0
    for item in root.findall("item"):
        qty = int(item.attrib["qty"])
        per_sku[item.attrib["sku"]] = qty
        total += qty
    out_stock = sorted(sku for sku, q in per_sku.items() if q == 0)
    result = {
        "skus": len(per_sku),
        "total_stock": total,
        "out_of_stock": out_stock,
        "fingerprint": chained_digest(raw + "inventory", ROUNDS),
    }
    json.dump(result, open(out, "w"), indent=2)
    print(f"tally_inventory_xml: {len(per_sku)} SKUs, total_stock={total}")


if __name__ == "__main__":
    main()
