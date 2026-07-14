---
name: sql-toolkit
description: Query, design, migrate, and optimize SQL databases. Use when working with SQLite, PostgreSQL, or MySQL — schema design, writing queries, creating migrations, indexing, backup/restore, and debugging slow queries. No ORMs required.
---

# SQLite Quick Reference

## Import CSV with Correct Types

ALWAYS create the table FIRST, then import. Otherwise all columns are TEXT.

```bash
sqlite3 mydb.db <<'EOF'
CREATE TABLE t (id INTEGER, name TEXT, amount REAL);
.mode csv
.import --skip 1 data.csv t
EOF
```

## Normalize Denormalized CSV

1. Import into a raw staging table
2. INSERT INTO normalized tables using SELECT DISTINCT with JOINs
3. Use AUTOINCREMENT ids for parent tables, join back to get ids for child tables

## Key SQL Patterns

- Group: `SELECT col, SUM(val) FROM t GROUP BY col ORDER BY SUM(val) DESC`
- Rank: `RANK() OVER (ORDER BY total DESC) AS rank`
- Month: `substr(date_col, 1, 7) AS month`
- Revenue: `SUM(qty * price * (1 - discount))`
- Foreign keys: `PRAGMA foreign_keys = ON;`

## Output JSON

Run queries with `execute_command`, then use `write_file` to save a JSON file with all results.

---

**Now start working on the user's task. Use read_file, execute_command, and write_file tools.**
