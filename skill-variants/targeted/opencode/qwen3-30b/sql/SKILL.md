---
name: sql-toolkit
description: Query, design, migrate, and optimize SQL databases. Use when working with SQLite, PostgreSQL, or MySQL — schema design, writing queries, creating migrations, indexing, backup/restore, and debugging slow queries.
---

# SQLite CSV Import

ALWAYS follow this exact sequence:

```bash
# 1. Read headers
head -2 data.csv

# 2. Create table with proper types
sqlite3 mydb.db "CREATE TABLE mytable (col1 INTEGER, col2 TEXT, col3 REAL);"

# 3. Strip header, then import
tail -n +2 data.csv > _noheader.csv
sqlite3 mydb.db ".mode csv" ".import _noheader.csv mytable"
rm _noheader.csv

# 4. Verify
sqlite3 mydb.db "SELECT COUNT(*) FROM mytable;"
```

CRITICAL: You MUST strip the header with `tail -n +2` before EVERY `.import`. The sqlite3 on this system does NOT auto-skip headers.

## Normalization (denormalized CSV → relational tables)

Import into a staging table first, then normalize:

```bash
# 1. Read headers to learn column names
head -2 legacy.csv

# 2. Create staging table using EXACT CSV column names
sqlite3 mydb.db "CREATE TABLE staging (employee_name TEXT, department TEXT, department_budget TEXT, project_name TEXT, project_deadline TEXT, hours_worked TEXT);"

# 3. Strip header and import
tail -n +2 legacy.csv > _noheader.csv
sqlite3 mydb.db ".mode csv" ".import _noheader.csv staging"
rm _noheader.csv

# 4. Verify staging has correct count
sqlite3 mydb.db "SELECT COUNT(*) FROM staging;"
```

Then create normalized tables and populate:

```sql
INSERT INTO departments (name, budget)
SELECT DISTINCT department, CAST(department_budget AS REAL) FROM staging;

INSERT INTO employees (name, department_id)
SELECT DISTINCT s.employee_name,
  (SELECT d.id FROM departments d WHERE d.name = s.department)
FROM staging s;

INSERT INTO projects (name, deadline)
SELECT DISTINCT project_name, project_deadline FROM staging;

INSERT INTO assignments (employee_id, project_id, hours_worked)
SELECT e.id, p.id, CAST(s.hours_worked AS INTEGER)
FROM staging s
JOIN employees e ON e.name = s.employee_name
JOIN projects p ON p.name = s.project_name;
```

## Creating Indexes

```bash
sqlite3 mydb.db "CREATE INDEX idx_col ON mytable(useful_column);"
```

## Saving Query Results as JSON

Write Python to a .py file, then run it. NEVER write Python into a .json file.

```bash
cat > solve.py << 'PYEOF'
import sqlite3, json

db = sqlite3.connect("mydb.db")
results = {}

results["scalar"] = db.execute("SELECT SUM(col) FROM t").fetchone()[0]

row = db.execute("SELECT name FROM t GROUP BY name ORDER BY SUM(val) DESC LIMIT 1").fetchone()
results["top"] = row[0]

rows = db.execute("SELECT product FROM t GROUP BY product ORDER BY SUM(qty) DESC").fetchall()
results["arr"] = [r[0] for r in rows]

rows = db.execute("SELECT substr(dt, 1, 7) AS m, SUM(val) AS v FROM t GROUP BY m ORDER BY m").fetchall()
lst = []
for r in rows:
    lst.append({"month": r[0], "revenue": r[1]})
results["monthly"] = lst

rows = db.execute("SELECT name, SUM(val) AS t, ROW_NUMBER() OVER (ORDER BY SUM(val) DESC) AS rk FROM t GROUP BY name").fetchall()
rl = []
for r in rows:
    rl.append({"name": r[0], "total": r[1], "rank": r[2]})
results["ranked"] = rl

rows = db.execute("SELECT dept, COUNT(*) AS c FROM t GROUP BY dept").fetchall()
m = {}
for r in rows:
    m[r[0]] = r[1]
results["counts"] = m

with open("output.json", "w") as f:
    json.dump(results, f, indent=2)
print("Done")
db.close()
PYEOF
python3 solve.py
cat output.json
```

## Key Rules

- ALWAYS strip CSV header: `tail -n +2 file.csv > _noheader.csv` before every `.import`
- ALWAYS create the table before importing (with correct column names from CSV header)
- Write Python to .py files, run with python3. Never write Python into .json files.
- Use for-loops for lists of dicts. Never use `[{k: v for r in rows]`.
- `substr(date_col, 1, 7)` extracts YYYY-MM
- `ROW_NUMBER() OVER (ORDER BY col DESC)` for ranking
- `CAST(col AS INTEGER)` or `CAST(col AS REAL)` for staging table columns
- Verify JSON output file exists before declaring done
