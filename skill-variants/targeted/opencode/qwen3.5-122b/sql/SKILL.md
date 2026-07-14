---
name: sql-toolkit
description: Query, design, migrate, and optimize SQL databases. Use when working with SQLite, PostgreSQL, or MySQL — schema design, writing queries, creating migrations, indexing, backup/restore, and debugging slow queries. Trigger for any task involving CSV-to-database import, SQL query writing, database schema design, or query performance optimization. Even if the user doesn't say "SQL" explicitly, use this when they want to analyze tabular data, normalize data, or work with .db files.
---

# SQL Toolkit

## Step 1: ALWAYS Read Input Files First

Before writing ANY code, read the input CSV file to see its actual columns and data:
```
read file_path="input.csv"
```
NEVER fabricate data. NEVER download files. Work with what exists in the current directory.

## Step 2: Use Python for Everything

ALWAYS use a single Python script. NEVER use the `sqlite3` command-line tool — it has CSV import bugs.

Run Python via bash heredoc:
```bash
python3 <<'PYEOF'
import csv, sqlite3, json, os

# ... your code here ...

PYEOF
```

## Template A: CSV Import + Queries → JSON

Use this pattern when importing CSV data into SQLite and answering queries:

```python
import csv, sqlite3, json, os

CSV_FILE = "data.csv"       # Adjust filename
DB_FILE = "database.db"     # Adjust filename
TABLE = "tablename"          # Adjust table name
OUTPUT = "results.json"      # Adjust output filename

if os.path.exists(DB_FILE):
    os.remove(DB_FILE)

conn = sqlite3.connect(DB_FILE)
cur = conn.cursor()

# Read CSV
with open(CSV_FILE) as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# Create table with CORRECT TYPES — this is critical
# Use INTEGER for whole numbers, REAL for decimals, TEXT for strings
cur.execute("""CREATE TABLE tablename (
    id INTEGER PRIMARY KEY,
    name TEXT,
    quantity INTEGER,
    price REAL,
    discount REAL,
    date TEXT
)""")

# Insert with explicit type conversion
for row in rows:
    cur.execute("INSERT INTO tablename VALUES (?,?,?,?,?,?)", (
        int(row["id"]),
        row["name"],
        int(row["quantity"]),
        float(row["price"]),
        float(row["discount"]),
        row["date"],
    ))
conn.commit()

# Create at least one index
cur.execute("CREATE INDEX idx_date ON tablename(date)")
conn.commit()

# Run queries and build results dict
results = {}

# IMPORTANT: Match the EXACT output format requested.
# If the task says "the sum of X" → return a single number
# If the task says "the customer_name with..." → return just the name STRING, not an object
# If the task says "an array of products..." → return ["Widget","Gadget",...] not [{product:...},...]
# If the task says "an array of objects with X, Y, Z" → return [{"X":...,"Y":...,"Z":...},...]

# Scalar value: just a number
cur.execute("SELECT SUM(quantity * price * (1 - discount)) FROM tablename")
results["total_revenue"] = round(cur.fetchone()[0], 2)

# Single string value: just the name, NOT an object
cur.execute("""
    SELECT name FROM tablename
    GROUP BY name ORDER BY SUM(quantity * price * (1 - discount)) DESC LIMIT 1
""")
results["top_name"] = cur.fetchone()[0]  # just "Alice", NOT {"name":"Alice",...}

# Array of strings: just names, NOT objects
cur.execute("SELECT product FROM tablename GROUP BY product ORDER BY SUM(quantity) DESC")
results["product_ranking"] = [r[0] for r in cur.fetchall()]  # ["Widget","Gadget",...]

# Array of objects with month+revenue: use dicts
cur.execute("""
    SELECT strftime('%Y-%m', date) AS month,
           ROUND(SUM(quantity * price * (1 - discount)), 2) AS revenue
    FROM tablename GROUP BY month ORDER BY month
""")
results["monthly"] = [{"month": r[0], "revenue": r[1]} for r in cur.fetchall()]

# Array of objects with rank: manual rank assignment
cur.execute("""
    SELECT name, ROUND(SUM(quantity * price * (1 - discount)), 2) AS total_spent
    FROM tablename GROUP BY name ORDER BY total_spent DESC
""")
ranked = cur.fetchall()
results["ranking"] = [
    {"customer_name": r[0], "total_spent": r[1], "rank": i+1}
    for i, r in enumerate(ranked)
]

conn.close()

with open(OUTPUT, "w") as f:
    json.dump(results, f, indent=2)
print(f"Saved {OUTPUT}")
```

## Template B: CSV Normalization → Relational Schema + Queries

Use this pattern when normalizing denormalized CSV data into multiple related tables:

```python
import csv, sqlite3, json, os

CSV_FILE = "legacy.csv"
DB_FILE = "normalized.db"
OUTPUT = "report.json"

if os.path.exists(DB_FILE):
    os.remove(DB_FILE)

conn = sqlite3.connect(DB_FILE)
conn.execute("PRAGMA foreign_keys = ON")
cur = conn.cursor()

# Read denormalized CSV
with open(CSV_FILE) as f:
    rows = list(csv.DictReader(f))

# Step 1: Create normalized tables with foreign keys
cur.execute("""CREATE TABLE departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    budget REAL
)""")

cur.execute("""CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    department_id INTEGER REFERENCES departments(id)
)""")

cur.execute("""CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    deadline TEXT
)""")

cur.execute("""CREATE TABLE assignments (
    employee_id INTEGER,
    project_id INTEGER,
    hours_worked INTEGER,
    PRIMARY KEY (employee_id, project_id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
)""")

# Step 2: Extract unique entities and insert (deduplication)
depts = {}
for row in rows:
    name = row["department"]
    if name not in depts:
        cur.execute("INSERT INTO departments (name, budget) VALUES (?, ?)",
                    (name, float(row["department_budget"])))
        depts[name] = cur.lastrowid

emps = {}
for row in rows:
    name = row["employee_name"]
    if name not in emps:
        dept_id = depts[row["department"]]
        cur.execute("INSERT INTO employees (name, department_id) VALUES (?, ?)",
                    (name, dept_id))
        emps[name] = cur.lastrowid

projs = {}
for row in rows:
    name = row["project_name"]
    if name not in projs:
        cur.execute("INSERT INTO projects (name, deadline) VALUES (?, ?)",
                    (name, row["project_deadline"]))
        projs[name] = cur.lastrowid

# Step 3: Insert assignments
for row in rows:
    cur.execute("INSERT INTO assignments VALUES (?, ?, ?)", (
        emps[row["employee_name"]],
        projs[row["project_name"]],
        int(row["hours_worked"]),
    ))

conn.commit()

# Step 4: Run queries
results = {}

cur.execute("SELECT COUNT(*) FROM employees")
results["total_employees"] = cur.fetchone()[0]

cur.execute("SELECT COUNT(*) FROM projects")
results["total_projects"] = cur.fetchone()[0]

# dept_headcount: dict mapping dept name → count
cur.execute("""
    SELECT d.name, COUNT(e.id)
    FROM departments d JOIN employees e ON e.department_id = d.id
    GROUP BY d.name
""")
results["dept_headcount"] = {r[0]: r[1] for r in cur.fetchall()}

# project_hours: sorted by total_hours DESC
cur.execute("""
    SELECT p.name AS project_name, SUM(a.hours_worked) AS total_hours
    FROM projects p JOIN assignments a ON a.project_id = p.id
    GROUP BY p.name ORDER BY total_hours DESC
""")
results["project_hours"] = [
    {"project_name": r[0], "total_hours": r[1]} for r in cur.fetchall()
]

# top_contributor: employee with most total hours
cur.execute("""
    SELECT e.name FROM employees e
    JOIN assignments a ON a.employee_id = e.id
    GROUP BY e.id ORDER BY SUM(a.hours_worked) DESC LIMIT 1
""")
results["top_contributor"] = cur.fetchone()[0]

# engineering_projects: projects with at least one Engineering employee, sorted alphabetically
cur.execute("""
    SELECT DISTINCT p.name FROM projects p
    JOIN assignments a ON a.project_id = p.id
    JOIN employees e ON e.id = a.employee_id
    JOIN departments d ON d.id = e.department_id
    WHERE d.name = 'Engineering'
    ORDER BY p.name
""")
results["engineering_projects"] = [r[0] for r in cur.fetchall()]

conn.close()

with open(OUTPUT, "w") as f:
    json.dump(results, f, indent=2)
print(f"Saved {OUTPUT}")
```

## Critical Rules

- **NEVER use `cd` or `mkdir`.** All files are in the current directory.
- **NEVER overwrite input CSV files.**
- **NEVER use the sqlite3 CLI tool.** Always use Python's sqlite3 module.
- **Always use correct types**: `int()` for integers, `float()` for decimals when inserting.
- **Revenue formula**: `quantity * unit_price * (1 - discount)`
- **Month grouping**: `strftime('%Y-%m', date_column)`
- **Foreign keys**: Use `REFERENCES` and enable with `PRAGMA foreign_keys = ON`
- **JSON output**: Use `json.dump(results, f, indent=2)` to write clean JSON files.
- **Deduplication**: When normalizing, track seen entities in a dict to avoid duplicates.
