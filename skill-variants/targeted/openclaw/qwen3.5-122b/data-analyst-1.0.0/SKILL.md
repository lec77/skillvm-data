---
name: data-analyst
version: 1.0.0
description: "CSV analysis, data cleaning, and report generation using Python scripts."
author: openclaw
---

# Data Analyst Skill

## CRITICAL RULES

1. **ALWAYS use Python scripts for ALL computations.** NEVER do arithmetic in your head or in text. Write a Python script, execute it, and use its output. Mental math leads to errors.
2. **ALWAYS write output files using Python scripts.** Do not write JSON by hand — have Python generate it with `json.dump()`.
3. **Data cleaning counting convention**: When counting data quality metrics like missing_values, dates_standardized, or invalid_emails:
   - "Before dedup" means you should report counts that reflect the UNIQUE data entities, not inflated by duplicate rows.
   - A duplicate row is an exact copy — it does not introduce NEW missing values or NEW date issues. The same entity's problems should be counted exactly once.
   - **Correct approach**: First identify which rows are duplicates. Then count issues ONLY on unique/distinct rows (one instance of each).
   - Example: If "Bob,bob@x.com,01/20/2026" appears twice, that's 1 date to standardize, not 2. If "Diana,,02-05-2026" appears twice, that's 1 missing value and 1 date to standardize.
   - duplicates_removed = total_rows - unique_rows

## Workflow

For every data analysis task:

1. **Read** the input CSV file(s) to understand structure
2. **Write a Python script** that:
   - Loads the CSV with `import csv` or `import pandas as pd`
   - Performs all computations programmatically
   - Writes output files (JSON, CSV) directly from computed results
   - Prints a summary to verify
3. **Execute** the script with `python3 script.py`
4. **Verify** output files by reading them back

## CSV Pivot / Aggregation Pattern

```python
import csv, json
from collections import defaultdict

with open('data.csv') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# Compute with code, never by hand
total = sum(float(r['amount']) * int(r['quantity']) for r in rows)

# Group by any field
by_product = defaultdict(lambda: {'revenue': 0, 'quantity': 0})
for r in rows:
    rev = float(r['amount']) * int(r['quantity'])
    by_product[r['product']]['revenue'] += rev
    by_product[r['product']]['quantity'] += int(r['quantity'])

# Write JSON output
with open('output.json', 'w') as f:
    json.dump(result, f, indent=2)
```

## Data Cleaning Pattern

**YOU MUST USE THIS EXACT SCRIPT STRUCTURE for data cleaning tasks. Copy it and adapt column names.**

```python
#!/usr/bin/env python3
import csv, json, re
from datetime import datetime

INPUT = 'messy_data.csv'  # Change to actual input filename

with open(INPUT) as f:
    rows = list(csv.DictReader(f))
    fieldnames = list(rows[0].keys())

# ========== STEP 1: DEDUPLICATE ==========
seen = set()
unique_rows = []
duplicates_removed = 0
for r in rows:
    key = tuple(r[c] for c in fieldnames)
    if key in seen:
        duplicates_removed += 1
    else:
        seen.add(key)
        unique_rows.append(r)

# ========== STEP 2: COUNT ISSUES ON unique_rows ONLY ==========
# CRITICAL: Use unique_rows for ALL counting. Never use rows.
# "before dedup" in the task description means "per unique entity"

missing_values = sum(
    1 for r in unique_rows for c in fieldnames if r[c].strip() == ''
)

date_col = 'signup_date'  # Change to actual date column name
date_re = re.compile(r'^\d{4}-\d{2}-\d{2}$')
dates_standardized = sum(
    1 for r in unique_rows
    if r[date_col].strip() and not date_re.match(r[date_col].strip())
)

invalid_emails = sum(
    1 for r in unique_rows
    if r['email'].strip() and '.' not in r['email'].split('@')[-1]
)

# ========== STEP 3: CLEAN unique_rows ==========
date_formats = ['%m/%d/%Y', '%m-%d-%Y', '%Y/%m/%d', '%B %d %Y', '%b %d %Y']
cleaned = []
for r in unique_rows:
    row = dict(r)
    d = row[date_col].strip()
    if d and not date_re.match(d):
        for fmt in date_formats:
            try:
                row[date_col] = datetime.strptime(d, fmt).strftime('%Y-%m-%d')
                break
            except ValueError:
                continue
    cleaned.append(row)

# ========== STEP 4: WRITE OUTPUTS ==========
with open('cleaned_data.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    w.writerows(cleaned)

with open('cleaning_report.json', 'w') as f:
    json.dump({
        'duplicates_removed': duplicates_removed,
        'missing_values': missing_values,
        'dates_standardized': dates_standardized,
        'invalid_emails': invalid_emails
    }, f, indent=2)
```

**Why count on unique_rows**: Each duplicate is an exact copy of another row. Counting a missing phone on both the original and its duplicate would report 2 missing values for what is really 1 entity with 1 missing phone. The report should reflect the actual number of distinct data quality issues.

Date format parsing order: `%m/%d/%Y` first (handles "02-05-2026" as month-day-year → Feb 5), then `%m-%d-%Y`, `%Y/%m/%d`, `%B %d %Y`.

## Multi-Dataset Analysis Pattern

When analyzing multiple CSV files:

1. Process each dataset independently first
2. Remove duplicate rows before computing any metrics
3. Watch for date format inconsistencies — standardize dates before analysis
4. Write individual analysis JSON files for each dataset
5. Write a cross-dataset report referencing findings from all analyses

```python
import csv, json

# Load and deduplicate
with open('data.csv') as f:
    rows = list(csv.DictReader(f))
seen = set()
unique = []
for r in rows:
    key = tuple(r.values())
    if key not in seen:
        seen.add(key)
        unique.append(r)

# Compute metrics on deduplicated data
total_revenue = sum(float(r['Revenue']) for r in unique)

# Low stock: Quantity < MinLevel
low_stock = [r['SKU'] for r in items if int(r['Quantity']) < int(r['MinLevel'])]

# Retention rate
active = sum(1 for r in customers if r['Active'].lower() == 'true')
retention_rate = round(active / len(customers) * 100, 2)

# Cross-dataset report must reference all datasets
report = {
    "summary": "Analysis across sales, inventory, and customer data...",
    "sales_insights": {"total_revenue": total_revenue, ...},
    "inventory_insights": {"low_stock_items": low_stock, ...},
    "customer_insights": {"retention_rate": retention_rate, ...}
}
```

## Output Format

- JSON files: Use `json.dump(data, f, indent=2)` for readable output
- CSV files: Use `csv.DictWriter` with the same column order as input
- All numeric values should be numbers (not strings) in JSON
- Arrays should be sorted as specified in the task
