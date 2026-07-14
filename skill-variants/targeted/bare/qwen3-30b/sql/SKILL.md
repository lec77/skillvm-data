---
name: sql-toolkit
description: Query, design, migrate, and optimize SQL databases. Use when working with SQLite, PostgreSQL, or MySQL — schema design, writing queries, creating migrations, indexing, backup/restore, and debugging slow queries. No ORMs required.
---

# SQL Toolkit

Work with relational databases from the command line using SQLite, PostgreSQL, or MySQL.

## SQLite Quick Reference

```bash
# Create/open database
sqlite3 mydb.sqlite

# Import CSV with proper types
sqlite3 mydb.sqlite ".mode csv" ".import data.csv mytable"

# One-liner query
sqlite3 mydb.sqlite "SELECT * FROM users LIMIT 10;"

# Export CSV
sqlite3 -header -csv mydb.sqlite "SELECT * FROM orders;" > out.csv
```

## Schema Design

```sql
-- Primary key with autoincrement
CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    value REAL NOT NULL CHECK(value >= 0),
    created_at TEXT DEFAULT (datetime('now'))
);

-- Foreign keys
CREATE TABLE details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    info TEXT
);

-- Composite primary key
CREATE TABLE assignments (
    a_id INTEGER,
    b_id INTEGER,
    value INTEGER,
    PRIMARY KEY(a_id, b_id),
    FOREIGN KEY(a_id) REFERENCES table_a(id),
    FOREIGN KEY(b_id) REFERENCES table_b(id)
);

-- Index
CREATE INDEX idx_details_item ON details(item_id);
```

## Query Patterns

```sql
-- Joins
SELECT a.name, b.total FROM users a
INNER JOIN orders b ON b.user_id = a.id;

-- Left join with aggregation
SELECT u.name, COUNT(o.id) AS cnt, COALESCE(SUM(o.total), 0) AS total
FROM users u LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;

-- Group by with having
SELECT status, COUNT(*) AS cnt, SUM(total) AS revenue
FROM orders GROUP BY status HAVING COUNT(*) > 10 ORDER BY revenue DESC;

-- Window functions
SELECT user_id, total,
    RANK() OVER (PARTITION BY user_id ORDER BY total DESC) AS rank
FROM orders;

-- CTEs
WITH summary AS (
    SELECT category, SUM(amount) AS total FROM records GROUP BY category
)
SELECT * FROM summary ORDER BY total DESC;
```

## Normalization Pattern

When denormalizing CSV data into relational tables:
1. Identify unique entities (extract distinct values for each dimension)
2. Create lookup tables with INTEGER PRIMARY KEY AUTOINCREMENT
3. Create junction/detail tables with foreign keys
4. INSERT INTO ... SELECT DISTINCT to populate lookup tables
5. Use subqueries to resolve foreign key IDs when populating detail tables

## JSON Output

When saving query results to JSON, use a script (Python/Node) to:
1. Run SQL queries against the database
2. Build a result object with the required keys
3. Write JSON with proper types (numbers as numbers, arrays as arrays)

## Tips

- Use `PRAGMA foreign_keys = ON;` to enforce foreign key constraints in SQLite
- Use `REAL` for decimal values, `INTEGER` for whole numbers in SQLite
- Use `COALESCE()` to handle NULLs in aggregations
- Use `ORDER BY ... DESC` for descending sorts
- For CSV import: `.mode csv` then `.import file.csv tablename`
- Always create indexes on foreign key columns and frequently filtered columns
