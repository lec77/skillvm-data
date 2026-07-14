---
name: sql-toolkit
description: Query, design, migrate, and optimize SQL databases with SQLite. Use when working with SQLite — schema design, CSV import, writing queries, creating migrations, and saving JSON results.
---

# SQL Toolkit for SQLite

## Critical Rules

1. **All output files go in the current working directory** — never create subdirectories like `db/`. If asked for `shop.db`, create it as `./shop.db`.
2. **Never use the write tool to create .db files.** SQLite databases must be created using `sqlite3` commands via exec. Using write creates a text file, not a database. Example: `sqlite3 company.db "CREATE TABLE ..."` — this creates a proper database file.
3. **CSV import into pre-existing tables**: Use `.import --skip 1` to skip the header row. Without it, the header causes "datatype mismatch" errors.
4. **CSV import into new temp tables**: Do NOT use `--skip 1` — the header row automatically becomes column names.
5. **Write JSON results using the write tool** — construct the JSON object from individual query results.

## CSV Import Patterns (Critical)

### Pattern A: Import into a pre-created table (typed columns)
Use `--skip 1` to skip the header row when the table already exists.

```bash
# Create table with explicit types FIRST
sqlite3 mydb.db "CREATE TABLE mytable (id INTEGER PRIMARY KEY, name TEXT, value REAL);"
# Import CSV, skipping the header row
sqlite3 mydb.db ".mode csv" ".import --skip 1 data.csv mytable"
```

### Pattern B: Import into a new temp table (for normalization)
Do NOT use `--skip 1` — let the header row become column names automatically.

```bash
# Import CSV — header becomes column names, all columns are TEXT
sqlite3 mydb.db ".mode csv" ".import legacy_data.csv temp_raw"
# Now temp_raw has columns: employee_name, department, etc. from the CSV header
# Use CAST() when inserting into typed tables: CAST(budget AS REAL)
```

**Rule**: `--skip 1` = table already exists with schema. No `--skip 1` = auto-create table from header.

## Schema Design

```sql
-- Proper types for SQLite
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    customer_name TEXT NOT NULL,
    product TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    discount REAL NOT NULL,
    order_date TEXT NOT NULL
);

-- Add useful indexes
CREATE INDEX idx_orders_customer ON orders(customer_name);
CREATE INDEX idx_orders_date ON orders(order_date);
```

## Normalization Pattern

When normalizing denormalized CSV data into multiple tables:

```sql
-- 1. Import raw CSV into a temp table
-- 2. Extract unique values into normalized tables
-- 3. Use SELECT DISTINCT to avoid duplicates

-- Example: Extract unique departments (CAST text to REAL for budget)
INSERT OR IGNORE INTO departments (name, budget)
SELECT DISTINCT department, CAST(department_budget AS REAL) FROM temp_raw;

-- Example: Extract unique employees (MUST use DISTINCT)
INSERT INTO employees (name, department_id)
SELECT DISTINCT t.employee_name, d.id
FROM temp_raw t
JOIN departments d ON d.name = t.department;

-- Example: Extract assignments (one per unique combo)
INSERT INTO assignments (employee_id, project_id, hours_worked)
SELECT e.id, p.id, t.hours_worked
FROM temp_raw t
JOIN employees e ON e.name = t.employee_name
JOIN projects p ON p.name = t.project_name;
```

**Key**: Always use `SELECT DISTINCT` when extracting unique entities from denormalized data to avoid duplicate rows.

## Query Patterns

```sql
-- Revenue calculation
SELECT SUM(quantity * unit_price * (1 - discount)) AS total_revenue FROM orders;

-- Top customer by spending
SELECT customer_name, SUM(quantity * unit_price * (1 - discount)) AS total_spent
FROM orders GROUP BY customer_name ORDER BY total_spent DESC LIMIT 1;

-- Product ranking by quantity
SELECT product, SUM(quantity) AS total_qty
FROM orders GROUP BY product ORDER BY total_qty DESC;

-- Monthly revenue (YYYY-MM format)
SELECT strftime('%Y-%m', order_date) AS month,
       SUM(quantity * unit_price * (1 - discount)) AS revenue
FROM orders GROUP BY month ORDER BY month;

-- Customer ranking with window function equivalent
SELECT customer_name,
       SUM(quantity * unit_price * (1 - discount)) AS total_spent
FROM orders GROUP BY customer_name ORDER BY total_spent DESC;
-- Then assign rank 1, 2, 3... based on position
```

## JSON Output

After running SQL queries, use the **write tool** to save results as JSON. Build the JSON object from query outputs:

```json
{
  "total_revenue": 2406.81,
  "top_customer": "Diana",
  "product_ranking": ["Widget", "Gadget", "Doohickey", "Gizmo"],
  "monthly_revenue": [
    {"month": "2026-01", "revenue": 424.86},
    {"month": "2026-02", "revenue": 604.88}
  ],
  "customer_rank": [
    {"customer_name": "Diana", "total_spent": 594.89, "rank": 1}
  ]
}
```

## Workflow

1. Read the CSV file to understand its structure
2. Create the database and tables with proper types in the **current directory**
3. Import CSV: use `--skip 1` for pre-created tables, no `--skip 1` for auto-created temp tables
4. Create indexes on useful columns
5. Run each query individually to get results
6. Combine all results into a JSON object and write it using the write tool
