---
name: data-analyst
version: 1.0.0
description: "CSV data analysis, cleaning, and report generation using Python scripts."
author: openclaw
---

# Data Analyst

Analyze CSV files, clean data, and produce JSON reports using Python.

## Workflow

1. Read input CSV files
2. Write a Python script to process data
3. Run the script with `python script.py`
4. Verify output files were created

## CSV Analysis Pattern

```python
import csv, json

# Read CSV
with open('data.csv') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# Deduplicate: convert each row dict to a frozen tuple for set comparison
seen = set()
unique = []
for row in rows:
    key = tuple(sorted(row.items()))
    if key not in seen:
        seen.add(key)
        unique.append(row)

# Aggregate
total = sum(float(r['amount']) for r in unique)
by_group = {}
for r in unique:
    g = r['category']
    by_group[g] = by_group.get(g, 0) + float(r['amount'])

# Write JSON output
with open('analysis.json', 'w') as f:
    json.dump({"total": total, "by_group": by_group}, f, indent=2)
```

## Data Cleaning Pattern

**IMPORTANT**: When a prompt says "count before dedup", it means count on unique/distinct rows only — do NOT count the same issue on duplicate rows multiple times.

Order of operations:
1. Deduplicate rows first (count how many duplicates removed)
2. Then count missing values, invalid emails, and dates needing standardization on the UNIQUE rows only
3. Then standardize dates on the unique rows
4. Write outputs

```python
import csv, json, re
from datetime import datetime

with open('input.csv') as f:
    rows = list(csv.DictReader(f))

# Step 1: Deduplicate first
seen = set()
unique = []
duplicates = 0
for row in rows:
    key = tuple(sorted(row.items()))
    if key in seen:
        duplicates += 1
    else:
        seen.add(key)
        unique.append(row)

# Step 2: Count issues on UNIQUE rows only (not on duplicates!)
missing = sum(1 for r in unique for v in r.values() if v.strip() == '')

# Count invalid emails on unique rows only
invalid_emails = sum(1 for r in unique if r['email'].strip() and '@' in r['email'] and '.' not in r['email'].split('@')[1])

# Step 3: Standardize dates on unique rows and count conversions
date_formats = ['%m/%d/%Y', '%m-%d-%Y', '%Y/%m/%d', '%B %d %Y']
dates_fixed = 0
for r in unique:
    d = r.get('date_col', '').strip()
    if d and not re.match(r'^\d{4}-\d{2}-\d{2}$', d):
        for fmt in date_formats:
            try:
                r['date_col'] = datetime.strptime(d, fmt).strftime('%Y-%m-%d')
                dates_fixed += 1
                break
            except ValueError:
                continue

# Step 4: Write outputs
with open('cleaned.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=unique[0].keys())
    w.writeheader()
    w.writerows(unique)

with open('report.json', 'w') as f:
    json.dump({"duplicates_removed": duplicates, "missing_values": missing, "dates_standardized": dates_fixed, "invalid_emails": invalid_emails}, f, indent=2)
```

## Multi-Dataset Analysis Pattern

When analyzing multiple CSV files, write ONE Python script that processes all files and writes all outputs:

```python
import csv, json

def read_csv(path):
    with open(path) as f:
        return list(csv.DictReader(f))

# Process each dataset
sales = read_csv('sales.csv')
inventory = read_csv('inventory.csv')
customers = read_csv('customers.csv')

# Deduplicate sales
seen = set()
unique_sales = []
for r in sales:
    key = tuple(sorted(r.items()))
    if key not in seen:
        seen.add(key)
        unique_sales.append(r)

# Sales analysis
total_rev = sum(float(r['Revenue']) for r in unique_sales)
rev_by_product = {}
for r in unique_sales:
    p = r['Product']
    rev_by_product[p] = rev_by_product.get(p, 0) + float(r['Revenue'])
top_product = max(rev_by_product, key=rev_by_product.get)

with open('sales_analysis.json', 'w') as f:
    json.dump({"total_revenue": total_rev, "top_product": top_product}, f, indent=2)

# Inventory analysis
low_stock = [r['SKU'] for r in inventory if int(r['Quantity']) < int(r['MinLevel'])]

with open('inventory_analysis.json', 'w') as f:
    json.dump({"total_items": len(inventory), "low_stock_items": low_stock}, f, indent=2)

# Customer analysis
active = sum(1 for r in customers if r['Active'].lower() == 'true')
churn = len(customers) - active

with open('customers_analysis.json', 'w') as f:
    json.dump({"retention_rate": round(active/len(customers)*100, 2), "churn_count": churn}, f, indent=2)

# Cross-dataset report
with open('report.json', 'w') as f:
    json.dump({"summary": "Cross-dataset analysis", "sales_total_revenue": total_rev, "top_product": top_product, "low_stock_items": low_stock, "customer_churn_count": churn, "retention_rate": round(active/len(customers)*100, 2)}, f, indent=2)
```

## Key Rules

- Always use Python `csv` module (no pandas needed)
- Write a single script, run it once with `python script.py`
- Output JSON files with `json.dump()`
- Deduplicate data before analysis
- Count quality issues on unique rows only
- Do not overthink — write the script and run it immediately
