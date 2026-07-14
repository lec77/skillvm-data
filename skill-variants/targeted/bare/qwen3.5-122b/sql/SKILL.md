---
name: sql-toolkit
description: Query, design, migrate, and optimize SQL databases with SQLite. Schema design, writing queries, CSV import, creating normalized schemas, indexing, and JSON output.
---

# SQL Toolkit

Work with SQLite databases from the command line. Patterns for schema design, CSV import, querying, normalization, and indexing.

## SQLite Quick Reference

```bash
# Create/open database
sqlite3 mydb.db

# Import CSV (creates table if needed)
sqlite3 mydb.db ".mode csv" ".import data.csv mytable" "SELECT COUNT(*) FROM mytable;"

# One-liner query
sqlite3 mydb.db "SELECT * FROM users LIMIT 10;"

# Export CSV
sqlite3 -header -csv mydb.db "SELECT * FROM orders;" > out.csv
```

## Schema Design

```sql
-- Create table with proper types
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT NOT NULL,
    product TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    discount REAL DEFAULT 0,
    order_date TEXT
);

-- Foreign keys
PRAGMA foreign_keys = ON;

CREATE TABLE departments (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    budget REAL
);

CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    department_id INTEGER REFERENCES departments(id)
);

CREATE TABLE assignments (
    employee_id INTEGER REFERENCES employees(id),
    project_id INTEGER REFERENCES projects(id),
    hours_worked INTEGER,
    PRIMARY KEY(employee_id, project_id)
);

-- Indexes
CREATE INDEX idx_orders_customer ON orders(customer);
```

## CSV Import & Type Handling

When importing CSV, SQLite stores everything as TEXT by default. Cast columns explicitly:

```sql
-- After .import, create proper typed table and copy
CREATE TABLE orders_typed AS
SELECT
    CAST(order_id AS INTEGER) AS order_id,
    customer_name,
    product,
    CAST(quantity AS INTEGER) AS quantity,
    CAST(unit_price AS REAL) AS unit_price,
    CAST(discount AS REAL) AS discount,
    order_date
FROM orders_raw;
```

Or create the table with explicit types first, then import.

## Query Patterns

### Aggregations & Grouping

```sql
-- Sum with expression
SELECT SUM(quantity * unit_price * (1 - discount)) AS total_revenue FROM orders;

-- Group by with aggregation
SELECT customer, SUM(quantity * unit_price * (1 - discount)) AS total_spent
FROM orders GROUP BY customer ORDER BY total_spent DESC;

-- Monthly grouping (SQLite: use strftime or substr)
SELECT substr(order_date, 1, 7) AS month,
       SUM(quantity * unit_price * (1 - discount)) AS revenue
FROM orders GROUP BY month ORDER BY month;

-- Count per group
SELECT department, COUNT(DISTINCT employee_name) AS headcount
FROM data GROUP BY department;
```

### Window Functions

```sql
-- Rank customers by spending
SELECT customer,
       SUM(total) AS total_spent,
       RANK() OVER (ORDER BY SUM(total) DESC) AS rank
FROM orders GROUP BY customer;
```

### Joins

```sql
-- Inner join
SELECT e.name, d.name AS dept
FROM employees e
JOIN departments d ON e.department_id = d.id;

-- Aggregation with join
SELECT p.name AS project_name, SUM(a.hours_worked) AS total_hours
FROM assignments a
JOIN projects p ON a.project_id = p.id
GROUP BY p.name ORDER BY total_hours DESC;

-- Filter by related table
SELECT DISTINCT p.name
FROM assignments a
JOIN employees e ON a.employee_id = e.id
JOIN departments d ON e.department_id = d.id
JOIN projects p ON a.project_id = p.id
WHERE d.name = 'Engineering'
ORDER BY p.name;
```

## Data Normalization

When denormalizing CSV data into relational tables:

1. Extract unique entities into lookup tables (departments, projects)
2. Create entity tables with auto-increment IDs
3. Map relationships using foreign keys
4. Use INSERT OR IGNORE for deduplication

```sql
-- Extract unique departments
INSERT OR IGNORE INTO departments (name, budget)
SELECT DISTINCT department, department_budget FROM legacy_data;

-- Map employees to department IDs
INSERT OR IGNORE INTO employees (name, department_id)
SELECT DISTINCT l.employee_name, d.id
FROM legacy_data l JOIN departments d ON l.department = d.name;
```

## JSON Output

Save query results to JSON using scripting:

```bash
# Use sqlite3 JSON mode
sqlite3 mydb.db ".mode json" "SELECT * FROM results;" > output.json
```

Or write a script that queries and outputs JSON with proper structure.

## Tips

- Always enable foreign keys: `PRAGMA foreign_keys = ON;`
- Use `CAST(col AS INTEGER)` or `CAST(col AS REAL)` when importing CSV data
- SQLite `substr(date_col, 1, 7)` extracts YYYY-MM from date strings
- Use `INSERT OR IGNORE` to handle duplicate key conflicts
- `RANK() OVER (ORDER BY ...)` works in SQLite 3.25+
- For JSON output, prefer `.mode json` or build JSON in application code
