---
name: data-analyst
version: 1.0.0
description: "Data analysis: CSV processing, aggregation, pivoting, cleaning, and report generation."
author: openclaw
---

# Data Analyst Skill

Analyze CSV data, produce structured JSON reports, and clean datasets.

## Step-by-Step Workflow

For EVERY data task:

1. **Read** the input CSV file completely — note column names and data types
2. **Plan** what calculations or transformations are needed
3. **Write a Python script** to do all processing in one pass
4. **Run** the script to generate output files
5. **Verify** output files exist and contain correct data

## CSV Pivot & Aggregation

When computing aggregations from CSV data:

### How to compute revenue
Revenue = `amount * quantity` computed **per row**, then sum the per-row values.
```python
# CORRECT: multiply per row first
revenue = float(row['amount']) * int(row['quantity'])  # per-row
total = sum(all per-row revenues)

# WRONG: do NOT sum amounts and quantities separately then multiply
```

### Grouping and sorting
- **Group by** a column: collect rows with same key, sum their values
- **Monthly breakdown**: extract `YYYY-MM` from date column, group by it, sort chronologically
- **Top item**: the one with the highest aggregate value
- **Sort descending**: largest value first

### JSON output rules
- Use exact field names from the prompt (e.g., `total_revenue` not `totalRevenue`)
- Numeric values must be numbers, not strings: `42100` not `"42100"`
- Use `json.dump(data, f, indent=2)`
- Arrays of objects for breakdowns: `[{"month": "2026-01", "revenue": 8150}, ...]`

## Data Cleaning

When cleaning messy CSV data, follow this exact order:

### Step 1: Read all rows from the original CSV
```python
import csv
with open('input.csv', newline='') as f:
    reader = csv.DictReader(f)
    all_rows = list(reader)
    fieldnames = reader.fieldnames
```

### Step 2: Identify unique rows and duplicates
Compare entire rows (all columns). A duplicate is an exact copy of another row.
```python
seen = []
unique_rows = []
duplicate_count = 0
for row in all_rows:
    row_tuple = tuple(row[col] for col in fieldnames)
    if row_tuple in seen:
        duplicate_count += 1
    else:
        seen.append(row_tuple)
        unique_rows.append(row)
```
`duplicates_removed` = number of extra copies removed.

### Step 3: Count issues on UNIQUE rows only

**Missing values**: Count every empty/blank cell across ALL columns in the unique rows.
```python
missing = 0
for row in unique_rows:
    for col in fieldnames:
        if row[col].strip() == '':
            missing += 1
```

**Dates needing standardization**: Among unique rows, count date values that are NOT already in `YYYY-MM-DD` format. Skip empty dates.
Formats to recognize:
- `MM/DD/YYYY` (e.g., `01/20/2026`)
- `MM-DD-YYYY` (e.g., `02-05-2026`)
- `YYYY/MM/DD` (e.g., `2026/02/10`)
- `Month D YYYY` (e.g., `March 3 2026`)
A date like `2026-01-15` is already standard — do NOT count it.

**Invalid emails**: Among unique rows, count emails that are PRESENT (non-empty) but malformed. An email is invalid if the domain part (after @) has no dot — e.g., `user@example` is invalid, `user@example.com` is valid. Empty emails are missing values, NOT invalid emails.

### Step 4: Standardize dates in unique rows
Convert all dates to `YYYY-MM-DD` format. Leave empty dates as empty.

### Step 5: Write output files
- **cleaned_data.csv**: Header + unique rows with standardized dates. Same columns as original.
- **cleaning_report.json**: `{"duplicates_removed": N, "missing_values": N, "dates_standardized": N, "invalid_emails": N}`

### Important: Empty vs Invalid
- Empty email field → **missing_value** (not invalid_email)
- Email like `charlie@example` → **invalid_email** (not missing_value)
- These categories never overlap

## Python Script Template

```python
import csv
import json
import re

# Read CSV
with open('input.csv', newline='') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    rows = list(reader)

# Process data...

# Write JSON output
with open('output.json', 'w') as f:
    json.dump(result, f, indent=2)

# Write CSV output
with open('output.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(cleaned_rows)
```

## Verification Checklist
- Output files exist with correct filenames
- JSON is valid and parseable
- Numeric values are numbers (not strings) in JSON
- Field names match exactly what was requested
- Totals match sum of parts (cross-check breakdowns against grand total)
