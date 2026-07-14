---
name: data-analyst
version: 1.0.0
description: CSV analysis, data cleaning, and JSON report generation
author: openclaw
---

# Data Analyst

Analyze CSV files and produce JSON outputs.

IMPORTANT: Write a Python script, then run it with bash. IGNORE any LSP diagnostics after writing. Just run the script with `python3 script.py`.

## How to Process CSV Data

Step 1: Read the CSV file with the read tool.
Step 2: Write a complete Python script to a .py file.
Step 3: Run it with bash: `python3 script.py`
Step 4: If it fails, write a NEW script file (e.g. script2.py) instead of editing.

## Python Script Rules

- Use `csv.DictReader` to read CSV files
- Use `json.dump(result, f, indent=2)` to write JSON
- Use plain `dict` with `.get()` for grouping (NOT defaultdict)
- Use `sorted(..., key=lambda x: -x[1])[0][0]` to find max
- Keep string literals on a single line, never split across lines
- Never use f-strings with + concatenation

## Aggregation Pattern

```python
import csv, json

with open('input.csv') as f:
    rows = list(csv.DictReader(f))

rev = {}
qty = {}
for r in rows:
    k = r['product']
    v = float(r['amount']) * int(r['quantity'])
    rev[k] = rev.get(k, 0) + v
    qty[k] = qty.get(k, 0) + int(r['quantity'])

top = sorted(rev.items(), key=lambda x: -x[1])[0][0]
```

For monthly breakdown: `month = r['date'][:7]`

## Data Cleaning - COMPLETE PATTERN

Use EXACTLY this pattern for data cleaning tasks:

```python
import csv, json, re
from datetime import datetime

with open('messy_data.csv') as f:
    reader = csv.reader(f)
    header = next(reader)
    all_rows = [row for row in reader]

# Step 1: Deduplicate
seen = set()
unique = []
for row in all_rows:
    key = tuple(row)
    if key not in seen:
        seen.add(key)
        unique.append(list(row))
dupes = len(all_rows) - len(unique)

# Step 2: Find column indices
date_col = header.index('signup_date')
email_col = header.index('email')

# Step 3: Count and fix dates in unique rows
dates_fixed = 0
for row in unique:
    d = row[date_col].strip()
    if not d:
        continue
    if re.match(r'^\d{4}-\d{2}-\d{2}$', d):
        continue
    converted = False
    for fmt in ['%m/%d/%Y', '%m-%d-%Y', '%Y/%m/%d', '%B %d %Y']:
        try:
            row[date_col] = datetime.strptime(d, fmt).strftime('%Y-%m-%d')
            converted = True
            break
        except ValueError:
            pass
    if converted:
        dates_fixed += 1

# Step 4: Count missing values in unique rows
missing = 0
for row in unique:
    for val in row:
        if val.strip() == '':
            missing += 1

# Step 5: Count invalid emails in unique rows
invalid_emails = 0
for row in unique:
    email = row[email_col].strip()
    if email and '@' in email:
        domain = email.split('@')[1]
        if '.' not in domain:
            invalid_emails += 1

# Write cleaned CSV
with open('cleaned_data.csv', 'w', newline='') as f:
    w = csv.writer(f)
    w.writerow(header)
    w.writerows(unique)

# Write report
with open('cleaning_report.json', 'w') as f:
    json.dump({
        "duplicates_removed": dupes,
        "missing_values": missing,
        "dates_standardized": dates_fixed,
        "invalid_emails": invalid_emails
    }, f, indent=2)
```

## Multi-Dataset Report

For multi-dataset tasks, write ONE Python script that processes ALL CSV files.

Keep string concatenation simple - use str() + operator on single lines only:

```python
report = {
    "summary": "Revenue: " + str(total_rev) + ". Top: " + top_prod,
    "inventory": str(len(low)) + " low stock items",
    "customers": "Retention: " + str(ret_rate) + "%"
}
```

Key metrics:
- Sales: `total_revenue` (sum Revenue after dedup), `top_product`, `revenue_by_region` (dict)
- Inventory: `total_items`, `low_stock_items` (SKU list where Quantity < MinLevel), `avg_quantity`
- Customers: `retention_rate` = round(active/total*100, 2), `churn_count`, `avg_spend_by_segment` (dict)
