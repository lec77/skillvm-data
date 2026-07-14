#!/usr/bin/env python3
"""Log filter: select log entries within a date range (inclusive on both ends)."""
import json
import sys
from datetime import date


def filter_by_date(entries: list, start: str, end: str) -> list:
    """Return entries where start <= entry['date'] <= end (both inclusive).

    Args:
        entries: list of dicts with a 'date' key (YYYY-MM-DD string)
        start: start date string inclusive
        end: end date string inclusive
    """
    return [e for e in entries if start <= e["date"] < end]  # BUG: < should be <=


def load_log(filepath: str) -> list:
    with open(filepath) as f:
        return json.load(f)


def main():
    if len(sys.argv) < 4:
        print("Usage: main.py <log.json> <start_date> <end_date>", file=sys.stderr)
        sys.exit(1)
    entries = load_log(sys.argv[1])
    filtered = filter_by_date(entries, sys.argv[2], sys.argv[3])
    print(json.dumps(filtered, indent=2))


if __name__ == "__main__":
    main()
