---
name: sql-toolkit
description: Query, design, migrate, and optimize SQL databases. Use when working with SQLite, PostgreSQL, or MySQL — schema design, writing queries, creating migrations, indexing, backup/restore, and debugging slow queries. No ORMs required.
---

# SQL Toolkit for SQLite

## CSV Import — CRITICAL Steps

When importing CSV into SQLite with a pre-created table:

```bash
# 1. Create table with explicit types
sqlite3 mydb.sqlite "CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT, val REAL);"

# 2. Import CSV — MUST skip header row to avoid datatype mismatch error
sqlite3 mydb.sqlite ".mode csv" ".import --skip 1 data.csv t"

# 3. Verify row count and types
sqlite3 mydb.sqlite "SELECT COUNT(*) FROM t;"
sqlite3 mydb.sqlite "SELECT typeof(val) FROM t LIMIT 1;"
```

NEVER use `.import` without `--skip 1` when the table already exists — the header row will cause "datatype mismatch" errors.

## Creating Indexes

```sql
CREATE INDEX idx_name ON tablename(column);
```

## Query Patterns

### Aggregation with arithmetic
```sql
SELECT SUM(quantity * unit_price * (1.0 - discount)) AS total FROM orders;
```
ALWAYS use `1.0` (not `1`) to force REAL arithmetic.

### Group by with ordering
```sql
SELECT product, SUM(quantity) AS total_qty
FROM orders GROUP BY product ORDER BY total_qty DESC;
```

### Monthly grouping (SQLite)
```sql
SELECT strftime('%Y-%m', order_date) AS month, SUM(amount) AS revenue
FROM orders GROUP BY strftime('%Y-%m', order_date) ORDER BY month;
```

### Window functions
```sql
SELECT customer_name, total_spent,
       RANK() OVER (ORDER BY total_spent DESC) AS rank
FROM (SELECT customer_name, SUM(amount) AS total_spent FROM orders GROUP BY customer_name);
```

### Joins
```sql
SELECT e.name, d.name AS dept FROM employees e
JOIN departments d ON e.department_id = d.id;
```

## Saving Results to JSON

ALWAYS use a Python script to run ALL queries and save results to JSON in one step. NEVER write JSON manually via the write tool — this risks truncating data or rounding values.

### CRITICAL format rules:

- **Single value** (e.g., "the customer_name with highest spending") → save as a **plain string or number**, NOT an object
- **"array of products"** or **"array of names"** → save as **array of strings**: `["A", "B", "C"]`
- **"array of objects with X and Y"** → save as **array of objects** with those exact field names. MUST include ALL rows, not just the first few
- **"object mapping X to Y"** → save as **plain dict**: `{"key1": val1, "key2": val2}`

### Python pattern — ALWAYS use this approach

```python
python3 << 'PYEOF'
import sqlite3, json

conn = sqlite3.connect("mydb.sqlite")

# Single scalar value
total = conn.execute("SELECT SUM(val) FROM t").fetchone()[0]

# Single string value — extract just the string, not the whole row
top_name = conn.execute("SELECT name FROM t ORDER BY val DESC LIMIT 1").fetchone()[0]

# Array of strings — extract just one column
names = [row[0] for row in conn.execute("SELECT name FROM t ORDER BY val DESC")]

# Array of objects — use dict with explicit keys — includes ALL rows automatically
items = [{"name": row[0], "value": row[1]} for row in conn.execute("SELECT name, val FROM t")]

# Dict mapping — key:value pairs
mapping = {row[0]: row[1] for row in conn.execute("SELECT name, COUNT(*) FROM t GROUP BY name")}

results = {"total": total, "top": top_name, "names": names, "items": items, "mapping": mapping}
with open("results.json", "w") as f:
    json.dump(results, f, indent=2)
conn.close()
PYEOF
```

IMPORTANT: Use `row[0]`, `row[1]` indexing to extract specific columns. Do NOT use `conn.row_factory = sqlite3.Row` followed by `dict(row)` — this creates objects when you need plain values.

IMPORTANT: The Python script MUST run ALL queries and build the complete JSON. Do NOT run queries separately via sqlite3 CLI and then try to manually construct the JSON file — this leads to truncated or incorrect data.

## Schema Normalization

When normalizing a flat CSV into multiple relational tables, use a SINGLE Python script that does everything:

1. Create the database and ALL tables
2. Read the CSV
3. Extract unique entities and insert into lookup tables
4. Insert dependent records
5. Verify row counts

NEVER create tables via sqlite3 CLI and then also via Python — pick ONE approach. Use Python for normalization tasks because it handles the data extraction logic.

```python
python3 << 'PYEOF'
import sqlite3, csv

conn = sqlite3.connect("company.db")
conn.execute("PRAGMA foreign_keys = ON")

# Create ALL tables in one script
conn.executescript("""
CREATE TABLE IF NOT EXISTS departments (id INTEGER PRIMARY KEY, name TEXT UNIQUE, budget REAL);
CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY, name TEXT, department_id INTEGER REFERENCES departments(id));
""")

# Read CSV
with open("data.csv") as f:
    rows = list(csv.DictReader(f))

# Extract and insert unique entities
seen = {}
for r in rows:
    if r["dept"] not in seen:
        conn.execute("INSERT INTO departments(name, budget) VALUES(?,?)", (r["dept"], float(r["budget"])))
        seen[r["dept"]] = conn.execute("SELECT last_insert_rowid()").fetchone()[0]

conn.commit()
conn.close()
PYEOF
```

ALWAYS use `CREATE TABLE IF NOT EXISTS` to avoid "table already exists" errors.

## Tips

- Use `PRAGMA foreign_keys = ON;` before inserting data with foreign key constraints
- Verify row counts after import
- Use `strftime('%Y-%m', date_col)` for month grouping in SQLite
- For normalization, do everything in ONE Python script — don't mix CLI and Python approaches
