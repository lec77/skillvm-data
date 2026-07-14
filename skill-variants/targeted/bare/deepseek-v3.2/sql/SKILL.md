---
name: sql-toolkit
description: Query, design, migrate, and optimize SQL databases with SQLite, PostgreSQL, or MySQL — schema design, queries, migrations, indexing.
---

# SQL Toolkit

## SQLite Quick Reference

```bash
# Create/open database
sqlite3 mydb.sqlite

# Import CSV
sqlite3 mydb.sqlite ".mode csv" ".import data.csv mytable"

# One-liner query
sqlite3 mydb.sqlite "SELECT * FROM users LIMIT 10;"

# Export CSV
sqlite3 -header -csv mydb.sqlite "SELECT * FROM orders;" > out.csv
```

## Schema Design

```sql
-- Create table with types and constraints
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Foreign keys (enable with PRAGMA foreign_keys=ON)
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    total REAL NOT NULL CHECK(total >= 0),
    status TEXT NOT NULL DEFAULT 'pending'
);

-- Composite primary key
CREATE TABLE assignments (
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    project_id INTEGER NOT NULL REFERENCES projects(id),
    hours_worked REAL,
    PRIMARY KEY (employee_id, project_id)
);

-- Index
CREATE INDEX idx_orders_user ON orders(user_id);
```

## CSV Import with Proper Types

SQLite imports CSV as TEXT by default. To get proper numeric types, create the table first with explicit types, then import:

```bash
# Method 1: Create schema first, then import (skip header)
sqlite3 mydb.sqlite <<'SQL'
CREATE TABLE data (id INTEGER, name TEXT, value REAL, discount REAL);
.mode csv
.import --skip 1 data.csv data
SQL

# Method 2: Import then cast via new table
sqlite3 mydb.sqlite <<'SQL'
.mode csv
.import data.csv raw_data
CREATE TABLE data AS SELECT
    CAST(id AS INTEGER) AS id,
    name,
    CAST(value AS REAL) AS value
FROM raw_data;
DROP TABLE raw_data;
SQL
```

## Query Patterns

```sql
-- Aggregation with GROUP BY
SELECT product, SUM(quantity) AS total_qty, SUM(quantity * price) AS revenue
FROM orders GROUP BY product ORDER BY revenue DESC;

-- Window function: RANK
SELECT name, total_spent,
    RANK() OVER (ORDER BY total_spent DESC) AS rank
FROM customer_totals;

-- Monthly grouping (SQLite: use substr for YYYY-MM)
SELECT substr(order_date, 1, 7) AS month, SUM(amount) AS revenue
FROM orders GROUP BY 1 ORDER BY 1;

-- CTE for multi-step analysis
WITH dept_counts AS (
    SELECT department_id, COUNT(*) AS headcount
    FROM employees GROUP BY department_id
)
SELECT d.name, dc.headcount
FROM departments d JOIN dept_counts dc ON d.id = dc.department_id;

-- Subquery: top contributor
SELECT name FROM employees WHERE id = (
    SELECT employee_id FROM assignments
    GROUP BY employee_id ORDER BY SUM(hours_worked) DESC LIMIT 1
);
```

## Data Normalization Pattern

When given denormalized CSV data, normalize into relational tables:

1. Identify unique entities (e.g., departments, employees, projects)
2. Create tables with proper PKs and FKs
3. Extract distinct values: `INSERT INTO departments (name) SELECT DISTINCT department FROM raw;`
4. Populate junction/assignment tables with JOINs back to parent tables for FK IDs

## Output as JSON

When saving query results to a JSON file, use the **simplest possible types**:
- Single values (totals, names): use plain numbers or strings, NOT objects
  - `"total_revenue": 2406.81` (number, not `{"value": 2406.81}`)
  - `"top_customer": "Diana"` (string, not `{"customer_name": "Diana", ...}`)
- Rankings/lists of names: use plain string arrays
  - `"product_ranking": ["Widget", "Gadget", "Gizmo"]` (not array of objects)
- Only use arrays of objects when each item needs multiple fields (e.g., customer_rank needs name + total_spent + rank)

```bash
# Use Python for structured JSON output
python3 -c "
import sqlite3, json
conn = sqlite3.connect('mydb.sqlite')
cur = conn.cursor()
results = {}

# Single scalar value
cur.execute('SELECT SUM(total) AS t FROM orders')
results['total'] = cur.fetchone()[0]

# Single string value
cur.execute('SELECT name FROM top_customers LIMIT 1')
results['top'] = cur.fetchone()[0]

# Array of strings (rankings)
cur.execute('SELECT product FROM orders GROUP BY product ORDER BY SUM(qty) DESC')
results['ranking'] = [r[0] for r in cur.fetchall()]

# Array of objects (when multiple fields needed)
cur.execute('SELECT name, spent, RANK() OVER (ORDER BY spent DESC) AS rank FROM ...')
results['ranks'] = [{'customer_name': r[0], 'total_spent': r[1], 'rank': r[2]} for r in cur.fetchall()]

with open('output.json', 'w') as f:
    json.dump(results, f, indent=2)
"
```

## Tips

- Enable foreign keys: `PRAGMA foreign_keys = ON;`
- SQLite `.mode csv` + `.import` reads all columns as TEXT; create table first for proper types
- Use `ROUND(value, 2)` for currency calculations
- `COALESCE(value, 0)` for NULL-safe aggregations
- Revenue with discount: `SUM(quantity * unit_price * (1 - discount))`
