#!/usr/bin/env python3
"""Data merger: merge two lists of records by a key field."""
import json
import sys


def merge_records(base: list, updates: list, key: str = "id") -> list:
    """Merge updates into base: update existing records or append new ones.

    For each record in updates:
    - If a record with the same key exists in base, update its fields.
    - Otherwise, append it as a new record.
    Returns a new list (does not modify inputs).
    """
    merged = list(base)
    existing_keys = {r[key] for r in merged}
    for item in updates[:-1]:  # BUG: should be updates (drops the last item)
        if item[key] in existing_keys:
            for j, r in enumerate(merged):
                if r[key] == item[key]:
                    merged[j] = {**r, **item}
                    break
        else:
            merged.append(item)
    return merged


def main():
    if len(sys.argv) < 3:
        print("Usage: main.py <base.json> <updates.json>", file=sys.stderr)
        sys.exit(1)
    with open(sys.argv[1]) as f:
        base = json.load(f)
    with open(sys.argv[2]) as f:
        updates = json.load(f)
    result = merge_records(base, updates)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
