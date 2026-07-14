---
name: sql-toolkit
description: SQLite database tasks. Use when importing CSV data, creating schemas, running queries, and saving JSON results.
---

# SQLite Toolkit

## Step-by-Step Workflow

1. Read the CSV file to understand its contents
2. Create database and tables with proper types
3. INSERT data using SQL INSERT statements (do NOT use .import)
4. Create indexes
5. Run queries to get results
6. Write results to JSON file

## CSV Import: Use INSERT Statements, NOT .import

CRITICAL: Do NOT use `.import` to load CSV data. The `.import` command imports the CSV header row as data, which corrupts query results. Instead:

1. Read the CSV file
2. Create the table with proper column types
3. Write INSERT statements with the actual data values from the CSV

Example:
```sql
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    amount REAL NOT NULL
);
INSERT INTO orders VALUES (1, 'Alice', 99.50), (2, 'Bob', 42.00);
```

## JSON Output Format Rules

When saving query results to a JSON file, follow these format rules exactly:

- If a field asks for "the customer_name with highest X", save it as a plain string:
  `"top_customer": "Diana"` NOT `"top_customer": {"customer_name": "Diana", ...}`

- If a field asks for "an array of products sorted by X", save it as an array of strings:
  `"product_ranking": ["Widget", "Gadget", "Gizmo"]` NOT `[{"product": "Widget", ...}, ...]`

- If a field asks for "an array of objects with X and Y", save it as an array of objects:
  `"project_hours": [{"project_name": "Alpha", "total_hours": 500}, ...]`

- IMPORTANT: When the prompt says "sorted by X descending", the JSON array MUST be in that exact order. Copy the order directly from the SQL query output.

## Writing JSON Files

When using the `write` tool, the `content` parameter MUST be a string. Pass JSON as a string:

```
write(path="results.json", content="{\"key\": 123, \"name\": \"Alice\"}")
```

Do NOT pass a raw object to content — it will fail validation.

## Querying: Run Simple Queries, Build JSON Manually

IMPORTANT: Do NOT try to build complex nested JSON inside SQLite using json_object/json_group_array. Instead, run each query separately, read the output, then construct the JSON string yourself.

### Query pattern:
```bash
# Run each query one at a time
sqlite3 mydb.sqlite "SELECT SUM(amount) FROM orders;"
sqlite3 mydb.sqlite "SELECT name FROM customers ORDER BY total DESC LIMIT 1;"
sqlite3 mydb.sqlite "SELECT DISTINCT p.name FROM projects p JOIN ... ORDER BY p.name;"
```

Then combine all results into a single JSON string and write it with the `write` tool.

### Common SQL patterns:

```sql
-- Sum with formula
SELECT SUM(quantity * unit_price * (1 - discount)) AS total FROM orders;

-- Top value by aggregate
SELECT customer_name FROM orders
GROUP BY customer_name
ORDER BY SUM(quantity * unit_price * (1 - discount)) DESC LIMIT 1;

-- Sorted list of distinct values
SELECT product FROM orders GROUP BY product ORDER BY SUM(quantity) DESC;

-- Group by month
SELECT strftime('%Y-%m', order_date) AS month,
       SUM(quantity * unit_price * (1 - discount)) AS revenue
FROM orders GROUP BY month ORDER BY month;

-- Ranking with window function
SELECT customer_name, total_spent,
       RANK() OVER (ORDER BY total_spent DESC) AS rank
FROM (SELECT customer_name,
             SUM(quantity * unit_price * (1 - discount)) AS total_spent
      FROM orders GROUP BY customer_name);

-- Distinct values filtered by join condition
SELECT DISTINCT p.name FROM projects p
JOIN assignments a ON p.id = a.project_id
JOIN employees e ON a.employee_id = e.id
JOIN departments d ON e.department_id = d.id
WHERE d.name = 'Engineering'
ORDER BY p.name;
```

## Normalization Pattern

When normalizing CSV data into relational tables:
1. Read the CSV to see all data
2. Create tables with foreign keys
3. INSERT unique values into parent tables
4. INSERT into child tables using subqueries: `(SELECT id FROM parent WHERE name = 'value')`
5. Run each query separately, then build JSON and save to file

## Creating Indexes

```sql
CREATE INDEX idx_orders_customer ON orders(customer_name);
```
