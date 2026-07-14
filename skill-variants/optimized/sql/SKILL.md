---
name: sql-toolkit
description: Query, design, migrate, and optimize SQL databases. Use when working with SQLite, PostgreSQL, or MySQL — schema design, writing queries, creating migrations, indexing, backup/restore, and debugging slow queries. Trigger for any task involving CSV-to-database import, SQL query writing, database schema design, or query performance optimization. Even if the user doesn't say "SQL" explicitly, use this when they want to analyze tabular data, normalize data, or work with .db files.
---

# SQL Toolkit

## Step 1: ALWAYS Read Input Files First

Before writing ANY code, read the input file using the `read` tool:
```
read file_path="orders.csv"
```

This ensures you work with real data. NEVER fabricate data. NEVER download files.

## Step 2: Use Python for Everything

ALWAYS use a single Python script for CSV→SQLite→JSON tasks. NEVER use the `sqlite3` command-line tool — it has CSV import bugs that waste time.

```bash
python3 <<'PYEOF'
import csv, sqlite3, json, os

CSV_FILE = "orders.csv"    # Input file (already exists in current directory)
DB_FILE = "shop.db"        # Database to create
TABLE = "orders"           # Table name
OUTPUT = "query_results.json"  # Output file

# Remove old DB if exists
if os.path.exists(DB_FILE):
    os.remove(DB_FILE)

conn = sqlite3.connect(DB_FILE)
cur = conn.cursor()

# Read CSV header to detect columns
with open(CSV_FILE) as f:
    reader = csv.DictReader(f)
    headers = reader.fieldnames
    rows = list(reader)

# Create table — adapt types to match your schema
# INTEGER for whole numbers, REAL for decimals, TEXT for strings
cur.execute(f"""CREATE TABLE {TABLE} (
    order_id INTEGER PRIMARY KEY,
    customer_name TEXT,
    product TEXT,
    quantity INTEGER,
    unit_price REAL,
    discount REAL,
    order_date TEXT
)""")

# Insert rows with type conversion
for row in rows:
    cur.execute(f"INSERT INTO {TABLE} VALUES (?,?,?,?,?,?,?)", (
        int(row["order_id"]),
        row["customer_name"],
        row["product"],
        int(row["quantity"]),
        float(row["unit_price"]),
        float(row["discount"]),
        row["order_date"],
    ))

conn.commit()

# Create index
cur.execute(f"CREATE INDEX idx_order_date ON {TABLE}(order_date)")
conn.commit()

print(f"Imported {len(rows)} rows into {TABLE}")

# Run queries and collect results
results = {}

# Adapt these queries to match the questions asked
cur.execute("SELECT SUM(quantity * unit_price * (1 - discount)) FROM orders")
results["total_revenue"] = round(cur.fetchone()[0], 2)

cur.execute("""
    SELECT customer_name FROM orders
    GROUP BY customer_name
    ORDER BY SUM(quantity * unit_price * (1 - discount)) DESC LIMIT 1
""")
results["top_customer"] = cur.fetchone()[0]

cur.execute("SELECT product FROM orders GROUP BY product ORDER BY SUM(quantity) DESC")
results["product_ranking"] = [r[0] for r in cur.fetchall()]

cur.execute("""
    SELECT strftime('%Y-%m', order_date) AS month,
           ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS revenue
    FROM orders GROUP BY month ORDER BY month
""")
results["monthly_revenue"] = [{"month": r[0], "revenue": r[1]} for r in cur.fetchall()]

cur.execute("""
    SELECT customer_name,
           ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS total_spent
    FROM orders GROUP BY customer_name ORDER BY total_spent DESC
""")
ranked = cur.fetchall()
results["customer_rank"] = [
    {"customer_name": r[0], "total_spent": r[1], "rank": i+1}
    for i, r in enumerate(ranked)
]

conn.close()

with open(OUTPUT, "w") as f:
    json.dump(results, f, indent=2)
print(f"Saved {OUTPUT}")
PYEOF
```

## Rules

- **NEVER use `cd` or `mkdir`.** Files are in the current directory.
- **NEVER overwrite input files.**
- **NEVER use sqlite3 CLI.** Always use Python.
- Revenue formula: `quantity * unit_price * (1 - discount)`
- Month grouping: `strftime('%Y-%m', order_date)`
