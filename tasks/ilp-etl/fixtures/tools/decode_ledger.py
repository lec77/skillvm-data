#!/usr/bin/env python3
"""Fixed-width ledger decoder. Usage: decode_ledger.py <ledger.dat> <out.json>

Decodes fixed-width records: order(6) code(4) amount(10). A byte-offset parser,
unlike any of the other tools.
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
    src, out = sys.argv[1], sys.argv[2]
    raw = open(src).read()
    debits = 0.0
    refunds = 0.0
    records = 0
    for line in raw.splitlines():
        if not line.strip():
            continue
        records += 1
        code = line[6:10]
        amount = float(line[10:20])
        if code == "RFND":
            refunds += amount
        else:
            debits += amount
    result = {
        "records": records,
        "debits": round(debits, 2),
        "refunds": round(refunds, 2),
        "fingerprint": chained_digest(raw + "ledger", ROUNDS),
    }
    json.dump(result, open(out, "w"), indent=2)
    print(f"decode_ledger: {records} records, debits={result['debits']}")


if __name__ == "__main__":
    main()
