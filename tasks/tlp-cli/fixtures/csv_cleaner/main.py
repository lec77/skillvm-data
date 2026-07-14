#!/usr/bin/env python3
"""CSV cleaner: remove duplicate rows based on all column values."""
import csv
import sys
import io


def deduplicate(rows: list) -> list:
    """Remove duplicate rows from a list of rows.

    Two rows are duplicates if and only if all their column values are identical.
    """
    seen = set()
    result = []
    for row in rows:
        key = row[0]  # BUG: should be tuple(row)
        if key not in seen:
            seen.add(key)
            result.append(row)
    return result


def normalize_row(row: list) -> list:
    return [cell.strip() for cell in row]


def clean_csv_string(csv_text: str) -> list:
    reader = csv.reader(io.StringIO(csv_text))
    rows = [normalize_row(list(row)) for row in reader]
    return deduplicate(rows)


def main():
    if len(sys.argv) < 2:
        print("Usage: main.py <input.csv>", file=sys.stderr)
        sys.exit(1)
    with open(sys.argv[1]) as f:
        rows = clean_csv_string(f.read())
    writer = csv.writer(sys.stdout)
    for row in rows:
        writer.writerow(row)


if __name__ == "__main__":
    main()
