---
name: sql-toolkit
description: SQLite database operations - import CSV, create schemas, write queries, save JSON results. Always use Python sqlite3 module.
---

# SQLite Toolkit

IMPORTANT: Always use Python's sqlite3 module for ALL SQLite operations. Do NOT use the sqlite3 CLI tool.

## Complete Pattern: Import CSV, Create DB, Query, Save JSON

Write a single Python script that does everything:

```python
import sqlite3, csv, json

conn = sqlite3.connect('output.db')
conn.execute("PRAGMA foreign_keys = ON")
c = conn.cursor()

# Step 1: Read CSV
with open('data.csv') as f:
    rows = list(csv.DictReader(f))

# Step 2: Create table with proper types
c.execute("""CREATE TABLE orders (
    order_id INTEGER, customer_name TEXT, product TEXT,
    quantity INTEGER, unit_price REAL, discount REAL, order_date TEXT
)""")

# Step 3: Insert data with proper type casting
for row in rows:
    c.execute("INSERT INTO orders VALUES (?,?,?,?,?,?,?)", (
        int(row['order_id']), row['customer_name'], row['product'],
        int(row['quantity']), float(row['unit_price']),
        float(row['discount']), row['order_date']
    ))

# Step 4: Create index
c.execute("CREATE INDEX idx_customer ON orders(customer_name)")

# Step 5: Run queries and build results dict
results = {}

# Scalar query
c.execute("SELECT SUM(quantity * unit_price * (1 - discount)) FROM orders")
results['total_revenue'] = round(c.fetchone()[0], 2)

# Single value query
c.execute("""SELECT customer_name FROM (
    SELECT customer_name, SUM(quantity * unit_price * (1 - discount)) as total
    FROM orders GROUP BY customer_name ORDER BY total DESC LIMIT 1
)""")
results['top_customer'] = c.fetchone()[0]

# Array of strings
c.execute("SELECT product FROM orders GROUP BY product ORDER BY SUM(quantity) DESC")
results['product_ranking'] = [r[0] for r in c.fetchall()]

# Array of objects
c.execute("""SELECT substr(order_date,1,7) as month,
    ROUND(SUM(quantity * unit_price * (1 - discount)), 2) as revenue
    FROM orders GROUP BY month ORDER BY month""")
results['monthly_revenue'] = [{'month': r[0], 'revenue': r[1]} for r in c.fetchall()]

# Ranking with window function equivalent
c.execute("""SELECT customer_name,
    ROUND(SUM(quantity * unit_price * (1 - discount)), 2) as total_spent
    FROM orders GROUP BY customer_name ORDER BY total_spent DESC""")
ranked = c.fetchall()
results['customer_rank'] = [
    {'customer_name': r[0], 'total_spent': r[1], 'rank': i+1}
    for i, r in enumerate(ranked)
]

# Step 6: Save JSON
conn.commit()
conn.close()
with open('query_results.json', 'w') as f:
    json.dump(results, f, indent=2)
```

## Normalization Pattern: CSV to Multiple Related Tables

When converting denormalized CSV to normalized tables, use DISTINCT to avoid duplicates:

```python
import sqlite3, csv, json

conn = sqlite3.connect('company.db')
conn.execute("PRAGMA foreign_keys = ON")
c = conn.cursor()

# Read CSV
with open('legacy_data.csv') as f:
    rows = list(csv.DictReader(f))

# Create normalized tables
c.execute("""CREATE TABLE departments (
    id INTEGER PRIMARY KEY, name TEXT UNIQUE, budget REAL)""")
c.execute("""CREATE TABLE employees (
    id INTEGER PRIMARY KEY, name TEXT,
    department_id INTEGER REFERENCES departments(id))""")
c.execute("""CREATE TABLE projects (
    id INTEGER PRIMARY KEY, name TEXT UNIQUE, deadline TEXT)""")
c.execute("""CREATE TABLE assignments (
    employee_id INTEGER, project_id INTEGER, hours_worked INTEGER,
    PRIMARY KEY(employee_id, project_id),
    FOREIGN KEY(employee_id) REFERENCES employees(id),
    FOREIGN KEY(project_id) REFERENCES projects(id))""")

# Extract UNIQUE departments
depts = {}
for row in rows:
    if row['department'] not in depts:
        c.execute("INSERT INTO departments (name, budget) VALUES (?,?)",
                  (row['department'], float(row['department_budget'])))
        depts[row['department']] = c.lastrowid

# Extract UNIQUE employees (use set to track seen names)
emps = {}
for row in rows:
    name = row['employee_name']
    if name not in emps:
        c.execute("INSERT INTO employees (name, department_id) VALUES (?,?)",
                  (name, depts[row['department']]))
        emps[name] = c.lastrowid

# Extract UNIQUE projects
projs = {}
for row in rows:
    pname = row['project_name']
    if pname not in projs:
        c.execute("INSERT INTO projects (name, deadline) VALUES (?,?)",
                  (pname, row['project_deadline']))
        projs[pname] = c.lastrowid

# Insert assignments (one per CSV row)
for row in rows:
    c.execute("INSERT INTO assignments VALUES (?,?,?)",
              (emps[row['employee_name']], projs[row['project_name']],
               int(row['hours_worked'])))

conn.commit()

# Query and save report
report = {}
c.execute("SELECT COUNT(*) FROM employees")
report['total_employees'] = c.fetchone()[0]

c.execute("SELECT COUNT(*) FROM projects")
report['total_projects'] = c.fetchone()[0]

# Dict mapping: department name -> employee count
c.execute("""SELECT d.name, COUNT(e.id) FROM departments d
    JOIN employees e ON d.id = e.department_id GROUP BY d.name""")
report['dept_headcount'] = {r[0]: r[1] for r in c.fetchall()}

# Array of objects sorted by total_hours descending
c.execute("""SELECT p.name, SUM(a.hours_worked) as total_hours
    FROM projects p JOIN assignments a ON p.id = a.project_id
    GROUP BY p.id ORDER BY total_hours DESC""")
report['project_hours'] = [{'project_name': r[0], 'total_hours': r[1]} for r in c.fetchall()]

# Single value: top contributor
c.execute("""SELECT e.name FROM employees e
    JOIN assignments a ON e.id = a.employee_id
    GROUP BY e.id ORDER BY SUM(a.hours_worked) DESC LIMIT 1""")
report['top_contributor'] = c.fetchone()[0]

# Array of strings sorted alphabetically
c.execute("""SELECT DISTINCT p.name FROM projects p
    JOIN assignments a ON p.id = a.project_id
    JOIN employees e ON a.employee_id = e.id
    JOIN departments d ON e.department_id = d.id
    WHERE d.name = 'Engineering' ORDER BY p.name""")
report['engineering_projects'] = [r[0] for r in c.fetchall()]

conn.close()
with open('migration_report.json', 'w') as f:
    json.dump(report, f, indent=2)
```

## Key Rules

1. ALWAYS use Python sqlite3 module - NEVER use sqlite3 CLI
2. Cast CSV values to proper types: int() for INTEGER, float() for REAL
3. Use DISTINCT or dict tracking to avoid duplicate rows when normalizing
4. Use round() for monetary/decimal values
5. Enable foreign keys: conn.execute("PRAGMA foreign_keys = ON")
6. Save results as JSON using json.dump()
