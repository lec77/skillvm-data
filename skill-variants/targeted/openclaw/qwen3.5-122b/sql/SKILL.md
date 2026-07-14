---
name: sql-toolkit
description: Query, design, migrate, and optimize SQL databases. Use when working with SQLite — schema design, writing queries, creating migrations, indexing, and data import/export.
---

# SQL Toolkit

Work with SQLite databases from the command line. Covers schema design, querying, migrations, indexing, and data operations.

## SQLite Quick Start

```bash
# Create/open a database
sqlite3 mydb.sqlite

# Import CSV directly
sqlite3 mydb.sqlite ".mode csv" ".import data.csv mytable" "SELECT COUNT(*) FROM mytable;"

# One-liner queries
sqlite3 mydb.sqlite "SELECT * FROM users WHERE created_at > '2026-01-01' LIMIT 10;"

# Export to CSV
sqlite3 -header -csv mydb.sqlite "SELECT * FROM orders;" > orders.csv
```

## Schema Operations

```sql
-- Create table with proper types
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    customer_name TEXT NOT NULL,
    product TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    discount REAL NOT NULL DEFAULT 0,
    order_date TEXT NOT NULL
);

-- Create with foreign key
CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id)
);

-- Composite primary key with foreign keys
CREATE TABLE assignments (
    employee_id INTEGER,
    project_id INTEGER,
    hours_worked INTEGER,
    PRIMARY KEY(employee_id, project_id),
    FOREIGN KEY(employee_id) REFERENCES employees(id),
    FOREIGN KEY(project_id) REFERENCES projects(id)
);

-- Import CSV: create table first, then import
.mode csv
.import --skip 1 data.csv orders

-- Create index
CREATE INDEX idx_orders_customer ON orders(customer_name);

-- View schema
.schema orders
.tables
```

## Normalizing Denormalized CSV Data

When CSV has repeated data (department on every row), extract unique values into lookup tables:

```sql
-- 1. Import into temp staging table
CREATE TABLE raw (emp TEXT, dept TEXT, budget TEXT, proj TEXT, deadline TEXT, hours TEXT);
.mode csv
.import --skip 1 data.csv raw

-- 2. Populate normalized tables from staging
INSERT INTO departments (name, budget)
SELECT DISTINCT dept, CAST(budget AS REAL) FROM raw;

INSERT INTO employees (name, department_id)
SELECT DISTINCT emp, (SELECT id FROM departments WHERE name = raw.dept) FROM raw;

INSERT INTO projects (name, deadline)
SELECT DISTINCT proj, deadline FROM raw;

INSERT INTO assignments (employee_id, project_id, hours_worked)
SELECT
    (SELECT id FROM employees WHERE name = raw.emp),
    (SELECT id FROM projects WHERE name = raw.proj),
    CAST(hours AS INTEGER)
FROM raw;

-- 3. Clean up
DROP TABLE raw;
```

## Query Patterns

```sql
-- Aggregation with GROUP BY
SELECT product, SUM(quantity) AS total_qty
FROM orders GROUP BY product ORDER BY total_qty DESC;

-- Revenue calculation
SELECT ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS total_revenue FROM orders;

-- Top customer by spending
SELECT customer_name FROM orders
GROUP BY customer_name
ORDER BY SUM(quantity * unit_price * (1 - discount)) DESC LIMIT 1;

-- Monthly grouping
SELECT substr(order_date, 1, 7) AS month,
    ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS revenue
FROM orders GROUP BY month ORDER BY month;

-- Window function for ranking
SELECT customer_name,
    ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS total_spent,
    RANK() OVER (ORDER BY SUM(quantity * unit_price * (1 - discount)) DESC) AS rank
FROM orders GROUP BY customer_name;

-- CTE
WITH dept_counts AS (
    SELECT d.name AS dept, COUNT(*) AS cnt
    FROM employees e JOIN departments d ON e.department_id = d.id
    GROUP BY d.name
)
SELECT * FROM dept_counts;
```

## Saving Results to JSON

When saving query results to a JSON file, pay close attention to what format each field expects:

- **Scalar fields** like "total_revenue" or "top_customer": save as a plain number or string value. Example: `"total_revenue": 2406.81` or `"top_customer": "Diana"`. Do NOT wrap in an object.
- **Array of names/strings** like "product_ranking" or "engineering_projects": save as `["Widget", "Gadget", "Gizmo"]`. Do NOT use objects like `[{"product": "Widget"}]`.
- **Array of objects** like "customer_rank with customer_name, total_spent, rank": save as `[{"customer_name": "Diana", "total_spent": 594.89, "rank": 1}, ...]`. Use the exact field names specified.
- **Mapping/dictionary** like "dept_headcount mapping department to count": save as `{"Engineering": 4, "Sales": 2}`.
- **Array of objects with specific fields** like "project_hours with project_name and total_hours": save as `[{"project_name": "Alpha", "total_hours": 500}, ...]`.

Use multiple sqlite3 queries step by step, then assemble the JSON using a write tool or a script. Make sure numbers are numbers (not strings) in the final JSON.

## Tips

- Always create the table with explicit types BEFORE `.import` — this ensures proper INTEGER/REAL types
- Use `PRAGMA foreign_keys = ON;` to enforce foreign key constraints
- Use `EXPLAIN QUERY PLAN` to check if queries use indexes
- For quick data exploration: `sqlite3 :memory: ".mode csv" ".import file.csv t" "SELECT ..."`
