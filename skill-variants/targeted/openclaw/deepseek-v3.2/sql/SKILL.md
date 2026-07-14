---
name: sql-toolkit
description: Query, design, migrate, and optimize SQL databases. Use when working with SQLite — schema design, writing queries, creating migrations, indexing, and data normalization. Trigger for any CSV-to-database import, SQL query writing, schema design, or data normalization task.
metadata: {"clawdbot":{"emoji":"🗄️","requires":{"anyBins":["sqlite3"]},"os":["linux","darwin","win32"]}}
---

# SQL Toolkit — SQLite Focus

## Step 1: Read Input Files First

Before writing code, read the input CSV to understand columns and data:
```
read file_path="data.csv"
```

## Step 2: Use Python for CSV→SQLite→JSON

Use a single Python script. Avoid the sqlite3 CLI for CSV import — Python gives reliable type control.

```python
import csv, sqlite3, json, os

# 1. Read CSV
with open("input.csv") as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# 2. Create DB and table with proper types
conn = sqlite3.connect("output.db")
cur = conn.cursor()
cur.execute("""CREATE TABLE mytable (
    id INTEGER PRIMARY KEY,
    name TEXT,
    amount REAL,
    count INTEGER
)""")

# 3. Insert with type conversion
for r in rows:
    cur.execute("INSERT INTO mytable VALUES (?,?,?,?)",
        (int(r["id"]), r["name"], float(r["amount"]), int(r["count"])))
conn.commit()

# 4. Create indexes on frequently queried columns
cur.execute("CREATE INDEX idx_name ON mytable(name)")

# 5. Query and build results
results = {}
cur.execute("SELECT SUM(amount) FROM mytable")
results["total"] = round(cur.fetchone()[0], 2)

conn.close()
with open("output.json", "w") as f:
    json.dump(results, f, indent=2)
```

## Key Patterns

### Revenue/Spending Calculation
```sql
SUM(quantity * unit_price * (1 - discount))
```

### Month Grouping (SQLite)
```sql
SELECT strftime('%Y-%m', date_col) AS month, SUM(val) FROM t GROUP BY month
```

### Ranking with Window Functions
```sql
SELECT name, total, RANK() OVER (ORDER BY total DESC) AS rank FROM t
```

### Data Normalization (Denormalized CSV → Multiple Tables)
When CSV has repeated data (e.g., employee+department in every row):

1. Create normalized tables with foreign keys
2. Extract unique values with `INSERT OR IGNORE` or `SELECT DISTINCT`
3. Use `PRAGMA foreign_keys = ON` before inserts
4. Map relationships via lookup queries

```python
# Enable foreign keys
cur.execute("PRAGMA foreign_keys = ON")

# Create parent table
cur.execute("CREATE TABLE departments (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, budget REAL)")

# Insert unique departments
for r in rows:
    cur.execute("INSERT OR IGNORE INTO departments (name, budget) VALUES (?, ?)",
        (r["department"], float(r["budget"])))

# Create child table with FK
cur.execute("""CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    department_id INTEGER REFERENCES departments(id)
)""")

# Insert employees with FK lookup
for name in unique_employees:
    cur.execute("""INSERT INTO employees (name, department_id)
        SELECT ?, id FROM departments WHERE name = ?""", (name, dept_map[name]))
```

## JSON Output Format Rules

- Single numbers: `{"total_revenue": 2406.81}`
- Strings: `{"top_customer": "Diana"}`
- Arrays of strings: `{"ranking": ["A", "B", "C"]}`
- Arrays of objects: `{"items": [{"name": "A", "value": 100}, ...]}`
- Objects/dicts: `{"counts": {"Engineering": 4, "Sales": 2}}`
- Always use `json.dump(results, f, indent=2)` for output
- Round floats to 2 decimal places with `round(val, 2)`

## Rules

- Read input files before writing code
- Use Python with `sqlite3` module, not the sqlite3 CLI
- Use proper types: INTEGER for whole numbers, REAL for decimals, TEXT for strings
- Always create at least one index
- Use `PRAGMA foreign_keys = ON` when using foreign keys
- Never overwrite input files
