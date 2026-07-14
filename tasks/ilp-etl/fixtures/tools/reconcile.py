#!/usr/bin/env python3
"""Reconciliation merge. Usage: reconcile.py

Reads the four extractor outputs and writes reconciliation.json. Depends on all
four, so it is the merge step after the independent (ILP) extractions.
"""
import json
import hashlib

SECTIONS = {
    "orders": "orders_parsed.json",
    "events": "events_rollup.json",
    "ledger": "ledger_decoded.json",
    "inventory": "inventory_tally.json",
}


def main() -> None:
    data = {k: json.load(open(v)) for k, v in SECTIONS.items()}

    # Cross-source checks across the four independent extractions.
    shipped = data["events"]["shipped"]
    ledger_records = data["ledger"]["records"]
    discrepancies = []
    if data["orders"]["orders"] < shipped:
        discrepancies.append("more-shipments-than-orders")
    if data["inventory"]["out_of_stock"]:
        discrepancies.append("out-of-stock-skus")

    combined = hashlib.sha256(
        "|".join(data[k]["fingerprint"] for k in ("orders", "events", "ledger", "inventory")).encode()
    ).hexdigest()[:16]

    report = {
        "sources_reconciled": len(SECTIONS),
        "total_revenue": data["orders"]["revenue"],
        "shipped_events": shipped,
        "ledger_records": ledger_records,
        "discrepancies": sorted(discrepancies),
        "balanced": len(discrepancies) == 0,
        "combined_fingerprint": combined,
    }
    json.dump(report, open("reconciliation.json", "w"), indent=2)
    print(f"reconcile: balanced={report['balanced']} discrepancies={report['discrepancies']}")


if __name__ == "__main__":
    main()
