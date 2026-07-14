---
name: sql-toolkit
description: Query, design, migrate, and optimize SQL databases with SQLite. Use for schema design, CSV import, writing queries, creating migrations, and saving results to JSON.
---

# SQL Toolkit

## SQLite CSV Import (Critical Pattern)

**Always create the table with explicit types BEFORE importing CSV.** Direct `.import` creates all TEXT columns.

```bash
# Step 1: Create table with proper types
sqlite3 mydb.sqlite "CREATE TABLE mytable (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    amount REAL,
    count INTEGER
);"

# Step 2: Import CSV (skip header with --skip 1)
sqlite3 mydb.sqlite <<'SQL'
.mode csv
.import --skip 1 data.csv mytable
SQL

# Step 3: Verify types
sqlite3 mydb.sqlite "SELECT typeof(amount), typeof(count) FROM mytable LIMIT 1;"
```

## Schema Design

```sql
-- Foreign keys with references
CREATE TABLE departments (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE,
    budget REAL
);

CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT,
    department_id INTEGER REFERENCES departments(id)
);

-- Composite primary key
CREATE TABLE assignments (
    employee_id INTEGER REFERENCES employees(id),
    project_id INTEGER REFERENCES projects(id),
    hours_worked INTEGER,
    PRIMARY KEY(employee_id, project_id)
);

-- Enable foreign key enforcement
PRAGMA foreign_keys = ON;

-- Create indexes
CREATE INDEX idx_emp_dept ON employees(department_id);
```

## Query Patterns

```sql
-- Aggregation with GROUP BY
SELECT product, SUM(quantity) AS total_qty
FROM orders GROUP BY product ORDER BY total_qty DESC;

-- Revenue calculation
SELECT SUM(quantity * unit_price * (1 - discount)) AS total_revenue FROM orders;

-- Top record
SELECT customer_name FROM orders
GROUP BY customer_name
ORDER BY SUM(quantity * unit_price * (1 - discount)) DESC LIMIT 1;

-- Monthly grouping (use substr for SQLite)
SELECT substr(order_date, 1, 7) AS month,
       SUM(quantity * unit_price * (1 - discount)) AS revenue
FROM orders GROUP BY month ORDER BY month;

-- Window function for ranking
SELECT customer_name, total_spent,
       RANK() OVER (ORDER BY total_spent DESC) AS rank
FROM (
    SELECT customer_name, SUM(quantity * unit_price * (1 - discount)) AS total_spent
    FROM orders GROUP BY customer_name
);

-- Join with aggregation
SELECT d.name, COUNT(e.id) AS headcount
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id
GROUP BY d.id, d.name;
```

## Saving Results to JSON

**Match the exact format requested.** When a field asks for a single value (e.g., "the customer_name"), return just that value as a string, not an object. When asked for "an array of products", return `["A","B","C"]` not `[{"product":"A"},...]`.

```bash
# Use sqlite3 JSON output + jq, or write a script:
sqlite3 mydb.sqlite -json "SELECT ..." | python3 -c "
import json, sys
rows = json.load(sys.stdin)
# Process and write results
result = {
    'total_revenue': rows[0]['rev'],      # scalar number
    'top_customer': rows[0]['name'],       # scalar string
    'product_ranking': [r['product'] for r in rows],  # array of strings
    'monthly_data': [{'month': r['m'], 'revenue': r['r']} for r in rows]  # array of objects
}
json.dump(result, open('results.json','w'), indent=2)
"
```

**Key JSON format rules:**
- "the X with the highest Y" → return just the X value as a string: `"top_customer": "Alice"`
- "array of X sorted by Y" → return simple array: `"ranking": ["A", "B", "C"]`
- "array of objects with fields a, b, c" → use those exact field names: `[{"a":1,"b":2,"c":3}]`
- "object mapping X to Y" → return dict: `{"key1": val1, "key2": val2}`

## Data Normalization (CSV to Relational)

When converting denormalized CSV to normalized tables:

```bash
# 1. Read CSV and extract unique values for each dimension table
sqlite3 company.db <<'SQL'
-- Create temp table to import raw CSV
CREATE TABLE raw (
    employee_name TEXT, department TEXT, department_budget REAL,
    project_name TEXT, project_deadline TEXT, hours_worked INTEGER
);
.mode csv
.import --skip 1 legacy_data.csv raw

-- Create normalized tables
CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT UNIQUE, budget REAL);
INSERT INTO departments (name, budget) SELECT DISTINCT department, department_budget FROM raw;

CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department_id INTEGER REFERENCES departments(id));
INSERT INTO employees (name, department_id)
SELECT DISTINCT r.employee_name, d.id FROM raw r JOIN departments d ON r.department = d.name;

CREATE TABLE projects (id INTEGER PRIMARY KEY, name TEXT UNIQUE, deadline TEXT);
INSERT INTO projects (name, deadline) SELECT DISTINCT project_name, project_deadline FROM raw;

CREATE TABLE assignments (
    employee_id INTEGER REFERENCES employees(id),
    project_id INTEGER REFERENCES projects(id),
    hours_worked INTEGER,
    PRIMARY KEY(employee_id, project_id)
);
INSERT INTO assignments (employee_id, project_id, hours_worked)
SELECT e.id, p.id, r.hours_worked
FROM raw r
JOIN employees e ON r.employee_name = e.name
JOIN projects p ON r.project_name = p.name;

DROP TABLE raw;
SQL
```
