---
name: sql-toolkit
description: Query, design, migrate, and optimize SQL databases. Use when working with SQLite, PostgreSQL, or MySQL — schema design, writing queries, creating migrations, indexing, backup/restore, and debugging slow queries. No ORMs required.
---

# SQL Toolkit — SQLite Focus

Use Python for ALL SQLite work. Never use the sqlite3 CLI for CSV import.

## Critical Rules

1. **Read input files first** with the read tool before writing any code
2. **Use a single Python script** — `python3 <<'PYEOF' ... PYEOF`
3. **Never use `cd` or `mkdir`** — files are in the current directory
4. **Never overwrite input files**
5. **Delete old .db file** before creating a new one: `os.remove(DB_FILE)` if it exists
6. **Enable foreign keys**: `conn.execute("PRAGMA foreign_keys = ON")`

## Pattern 1: CSV to SQLite to JSON

For tasks that import CSV data, query it, and save results:

```python
import csv, sqlite3, json, os

DB = "shop.db"
if os.path.exists(DB): os.remove(DB)
conn = sqlite3.connect(DB)
cur = conn.cursor()

# 1. Read CSV
with open("data.csv") as f:
    rows = list(csv.DictReader(f))

# 2. Create table with proper types (INTEGER, REAL, TEXT)
cur.execute("""CREATE TABLE t (
    id INTEGER PRIMARY KEY,
    name TEXT,
    value REAL,
    date TEXT
)""")

# 3. Insert with type conversion
for r in rows:
    cur.execute("INSERT INTO t VALUES (?,?,?,?)",
        (int(r["id"]), r["name"], float(r["value"]), r["date"]))
conn.commit()

# 4. Create useful index
cur.execute("CREATE INDEX idx_date ON t(date)")
conn.commit()

# 5. Run queries, collect results
results = {}

# Revenue: SUM(quantity * unit_price * (1 - discount))
cur.execute("SELECT SUM(quantity * unit_price * (1 - discount)) FROM orders")
results["total_revenue"] = round(cur.fetchone()[0], 2)

# Group by month: strftime('%Y-%m', date_column)
cur.execute("""
    SELECT strftime('%Y-%m', order_date) AS month,
           ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS revenue
    FROM orders GROUP BY month ORDER BY month
""")
results["monthly_revenue"] = [{"month": r[0], "revenue": r[1]} for r in cur.fetchall()]

# Ranking with window function or manual rank
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

# 6. Save JSON
conn.close()
with open("query_results.json", "w") as f:
    json.dump(results, f, indent=2)
```

## Pattern 2: Normalize Denormalized CSV

For tasks that split a flat CSV into relational tables:

```python
import csv, sqlite3, json, os

DB = "company.db"
if os.path.exists(DB): os.remove(DB)
conn = sqlite3.connect(DB)
conn.execute("PRAGMA foreign_keys = ON")
cur = conn.cursor()

# 1. Read denormalized CSV
with open("legacy_data.csv") as f:
    rows = list(csv.DictReader(f))

# 2. Create normalized tables with foreign keys
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

# 3. Extract unique entities and insert
depts = {}
for r in rows:
    if r["department"] not in depts:
        cur.execute("INSERT INTO departments (name, budget) VALUES (?,?)",
            (r["department"], float(r["budget"])))
        depts[r["department"]] = cur.lastrowid

emps = {}
for r in rows:
    if r["employee_name"] not in emps:
        cur.execute("INSERT INTO employees (name, department_id) VALUES (?,?)",
            (r["employee_name"], depts[r["department"]]))
        emps[r["employee_name"]] = cur.lastrowid

projs = {}
for r in rows:
    if r["project_name"] not in projs:
        cur.execute("INSERT INTO projects (name, deadline) VALUES (?,?)",
            (r["project_name"], r["deadline"]))
        projs[r["project_name"]] = cur.lastrowid

for r in rows:
    cur.execute("INSERT INTO assignments VALUES (?,?,?)",
        (emps[r["employee_name"]], projs[r["project_name"]], int(r["hours_worked"])))

conn.commit()

# 4. Query and save results
results = {}
cur.execute("SELECT COUNT(*) FROM employees")
results["total_employees"] = cur.fetchone()[0]

cur.execute("SELECT COUNT(*) FROM projects")
results["total_projects"] = cur.fetchone()[0]

# dept_headcount: {"Engineering": 4, "Marketing": 2, "Sales": 2}
cur.execute("""
    SELECT d.name, COUNT(e.id)
    FROM departments d JOIN employees e ON e.department_id = d.id
    GROUP BY d.name
""")
results["dept_headcount"] = {r[0]: r[1] for r in cur.fetchall()}

# project_hours sorted descending
cur.execute("""
    SELECT p.name, SUM(a.hours_worked) AS total
    FROM projects p JOIN assignments a ON a.project_id = p.id
    GROUP BY p.name ORDER BY total DESC
""")
results["project_hours"] = [{"project_name": r[0], "total_hours": r[1]} for r in cur.fetchall()]

# top_contributor: employee with most total hours
cur.execute("""
    SELECT e.name, SUM(a.hours_worked) AS total
    FROM employees e JOIN assignments a ON a.employee_id = e.id
    GROUP BY e.name ORDER BY total DESC LIMIT 1
""")
results["top_contributor"] = cur.fetchone()[0]

# engineering_projects: projects with Engineering employees, sorted alphabetically
cur.execute("""
    SELECT DISTINCT p.name
    FROM projects p
    JOIN assignments a ON a.project_id = p.id
    JOIN employees e ON e.employee_id = a.employee_id
    JOIN departments d ON d.id = e.department_id
    WHERE d.name = 'Engineering'
    ORDER BY p.name
""")
results["engineering_projects"] = [r[0] for r in cur.fetchall()]

conn.close()
with open("migration_report.json", "w") as f:
    json.dump(results, f, indent=2)
```

## Key SQL Patterns

- **Aggregation**: `SELECT col, SUM(x) FROM t GROUP BY col HAVING COUNT(*) > n`
- **Window rank**: `RANK() OVER (PARTITION BY col ORDER BY val DESC)`
- **Month grouping**: `strftime('%Y-%m', date_col)`
- **Revenue**: `SUM(quantity * unit_price * (1 - discount))`
- **CTE**: `WITH cte AS (SELECT ...) SELECT ... FROM cte`
- **JSON output**: Always use `json.dump(results, f, indent=2)`
