---
name: data-analyst
version: 1.0.0
description: "CSV data analysis, cleaning, aggregation, and JSON report generation using Python."
author: openclaw
---

# Data Analyst Skill

Analyze CSV files, clean data, compute aggregations, and produce structured JSON reports.

## Workflow

1. Read input CSV files to understand structure
2. Write a Python script to process the data
3. Execute the script with `execute_command`
4. Verify output files were created

**Always use Python scripts for data processing.** Write the full script to a .py file, then run it. Do not try to do complex processing manually.

## CSV Analysis Pattern

```python
import csv, json
from collections import defaultdict

# Read CSV
with open('data.csv') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# Aggregate
totals = defaultdict(float)
for row in rows:
    totals[row['category']] += float(row['amount']) * int(row['quantity'])

# Write JSON output
result = {"total": sum(totals.values()), "by_category": dict(totals)}
with open('output.json', 'w') as f:
    json.dump(result, f, indent=2)
```

## Data Cleaning Pattern

**CRITICAL: For data cleaning reports, follow this exact process:**
1. Read the raw CSV
2. **Deduplicate rows FIRST** — remove exact duplicate rows
3. **Count issues ONLY on deduplicated rows** — duplicate rows inflate counts and must not be counted
4. Standardize dates and write cleaned CSV + report JSON

**Why count after dedup:** If Bob's row with date "01/20/2026" appears twice (original + duplicate), that is 1 date to standardize, not 2. The duplicate is the same data quality issue, not an additional one. Same applies to missing values — Diana's missing phone in a duplicate row is the same gap.

```python
import csv, json, re
from datetime import datetime

with open('messy_data.csv') as f:
    reader = csv.DictReader(f)
    rows = list(reader)
    fieldnames = reader.fieldnames

# Step 1: Deduplicate first
seen = []
unique_rows = []
for row in rows:
    key = tuple(row[f] for f in fieldnames)
    if key not in seen:
        seen.append(key)
        unique_rows.append(row)
duplicates_removed = len(rows) - len(unique_rows)

# Step 2: Count issues on unique rows
missing_values = 0
dates_standardized = 0
invalid_emails = 0

for row in unique_rows:
    # Count missing/empty cells
    for key in fieldnames:
        if not row[key].strip():
            missing_values += 1

    # Count dates needing conversion (not already YYYY-MM-DD)
    date_val = ''
    for key in fieldnames:
        if 'date' in key.lower():
            date_val = row[key]
    if date_val.strip() and not re.match(r'^\d{4}-\d{2}-\d{2}$', date_val.strip()):
        dates_standardized += 1

    # Count invalid emails (missing TLD like user@domain without .com)
    email = row.get('email', '').strip()
    if email and not re.search(r'\.\w{2,}$', email):
        invalid_emails += 1

# Step 3: Standardize dates
def parse_date(d):
    d = d.strip()
    if not d:
        return d
    for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%m-%d-%Y', '%Y/%m/%d', '%B %d %Y', '%b %d %Y']:
        try:
            return datetime.strptime(d, fmt).strftime('%Y-%m-%d')
        except ValueError:
            continue
    return d

for row in unique_rows:
    for key in fieldnames:
        if 'date' in key.lower():
            row[key] = parse_date(row[key])

# Step 4: Write outputs
with open('cleaned_data.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(unique_rows)

report = {
    "duplicates_removed": duplicates_removed,
    "missing_values": missing_values,
    "dates_standardized": dates_standardized,
    "invalid_emails": invalid_emails
}
with open('cleaning_report.json', 'w') as f:
    json.dump(report, f, indent=2)
```

## Multi-File Analysis Pattern

When analyzing multiple CSV files, process each independently and then create a summary:

```python
import csv, json

# Process each file
def read_csv(path):
    with open(path) as f:
        return list(csv.DictReader(f))

# Deduplicate rows
def dedup(rows, fieldnames):
    seen = set()
    unique = []
    for row in rows:
        key = tuple(row[f] for f in fieldnames)
        if key not in seen:
            seen.add(key)
            unique.append(row)
    return unique

# Compute aggregations
sales = read_csv('sales.csv')
# ... analyze and write JSON results
```

## Key Rules

- **Use Python with csv and json modules** — they are always available
- **Write complete scripts** — don't rely on pandas unless you know it's installed
- **Always verify output** — read back generated files to confirm they exist
- **Handle edge cases** — empty cells, varied date formats, duplicate rows
- **Round numbers appropriately** — use round() for percentages, keep decimals for monetary values
- **Dedup first, then count** — remove duplicate rows first, then count data quality issues on unique rows only
