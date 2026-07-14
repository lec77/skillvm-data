#!/usr/bin/env python3
"""
CSV → SQLite → JSON query pipeline.
Usage: python3 csv_to_sqlite_json.py <csv_file> <db_file> <table_name> <output_json> <queries_json>

Arguments:
  csv_file:     Path to the input CSV file
  db_file:      Path to the SQLite database to create
  table_name:   Name of the table to create
  output_json:  Path to save query results
  queries_json: Path to a JSON file with query definitions (see below)

The queries_json file must contain a JSON object where each key is the result key
and each value is an object with:
  - "sql": the SQL query to execute
  - "type": one of "scalar", "column", "rows", "ranked_rows"
    - scalar: returns the first column of the first row
    - column: returns an array of the first column values
    - rows: returns an array of row objects
    - ranked_rows: returns an array of row objects with an added "rank" field (1-based)

Example queries.json:
{
  "total_revenue": {
    "sql": "SELECT SUM(quantity * unit_price * (1 - discount)) AS val FROM orders",
    "type": "scalar",
    "round": 2
  },
  "top_customer": {
    "sql": "SELECT customer_name AS val FROM orders GROUP BY customer_name ORDER BY SUM(quantity * unit_price * (1 - discount)) DESC LIMIT 1",
    "type": "scalar"
  },
  "product_ranking": {
    "sql": "SELECT product FROM orders GROUP BY product ORDER BY SUM(quantity) DESC",
    "type": "column"
  }
}
"""

import csv
import json
import sqlite3
import sys
import os


def detect_types(csv_path, table_name, type_hints=None):
    """Read CSV header and first row to detect column types."""
    with open(csv_path, 'r') as f:
        reader = csv.reader(f)
        headers = next(reader)
        first_row = next(reader)

    col_defs = []
    for i, (name, val) in enumerate(zip(headers, first_row)):
        if type_hints and name in type_hints:
            col_type = type_hints[name]
        else:
            try:
                int(val)
                col_type = "INTEGER"
            except ValueError:
                try:
                    float(val)
                    col_type = "REAL"
                except ValueError:
                    col_type = "TEXT"
        col_defs.append(f"    {name} {col_type}")

    return headers, col_defs


def main():
    if len(sys.argv) < 5:
        print("Usage: python3 csv_to_sqlite_json.py <csv_file> <db_file> <table_name> <output_json> [queries_json]")
        sys.exit(1)

    csv_file = sys.argv[1]
    db_file = sys.argv[2]
    table_name = sys.argv[3]
    output_json = sys.argv[4]
    queries_file = sys.argv[5] if len(sys.argv) > 5 else None

    if not os.path.exists(csv_file):
        print(f"Error: CSV file not found: {csv_file}")
        sys.exit(1)

    # Detect types from CSV
    headers, col_defs = detect_types(csv_file, table_name)

    # Create database and table
    if os.path.exists(db_file):
        os.remove(db_file)

    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    create_sql = f"CREATE TABLE {table_name} (\n" + ",\n".join(col_defs) + "\n)"
    cur.execute(create_sql)

    # Import CSV
    with open(csv_file, 'r') as f:
        reader = csv.DictReader(f)
        placeholders = ", ".join(["?"] * len(headers))
        insert_sql = f"INSERT INTO {table_name} VALUES ({placeholders})"
        for row in reader:
            values = []
            for h in headers:
                v = row[h]
                try:
                    values.append(int(v))
                except ValueError:
                    try:
                        values.append(float(v))
                    except ValueError:
                        values.append(v)
            cur.execute(insert_sql, values)

    conn.commit()

    # Create index on first text column that isn't the primary key
    for i, h in enumerate(headers):
        if i > 0 and "date" in h.lower():
            cur.execute(f"CREATE INDEX IF NOT EXISTS idx_{h} ON {table_name}({h})")
            break
    else:
        if len(headers) > 1:
            cur.execute(f"CREATE INDEX IF NOT EXISTS idx_{headers[1]} ON {table_name}({headers[1]})")

    conn.commit()

    row_count = cur.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]
    print(f"Imported {row_count} rows into {table_name}")

    # Run queries if provided
    if queries_file and os.path.exists(queries_file):
        with open(queries_file) as f:
            queries = json.load(f)

        results = {}
        for key, qdef in queries.items():
            sql = qdef["sql"]
            qtype = qdef.get("type", "scalar")
            rounding = qdef.get("round")

            cur.execute(sql)

            if qtype == "scalar":
                val = cur.fetchone()[0]
                if rounding is not None and isinstance(val, (int, float)):
                    val = round(val, rounding)
                results[key] = val

            elif qtype == "column":
                results[key] = [row[0] for row in cur.fetchall()]

            elif qtype == "rows":
                results[key] = [dict(row) for row in cur.fetchall()]

            elif qtype == "ranked_rows":
                rows = cur.fetchall()
                results[key] = []
                for i, row in enumerate(rows):
                    d = dict(row)
                    d["rank"] = i + 1
                    results[key].append(d)

        with open(output_json, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"Saved query results to {output_json}")
    else:
        print(f"Database created: {db_file}")
        print("No queries file provided. Provide a queries JSON to run queries.")

    conn.close()


if __name__ == "__main__":
    main()
