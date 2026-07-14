---
name: data-analyst
version: 1.0.0
description: "Data analysis, CSV/spreadsheet processing, data cleaning, aggregation, and report generation. Use this skill whenever the user wants to analyze data files (CSV, TSV, Excel), clean messy data, compute summaries or aggregations, pivot data, generate reports from datasets, or produce structured output (JSON, CSV) from raw data."
---

# Data Analyst

Analyze data files, clean messy datasets, compute aggregations, and produce structured reports.

## Workflow

For every data task, follow this sequence:

1. **Read and understand the data** — Examine the file to understand its structure, columns, types, and size. Look at every row if the dataset is small (<100 rows); sample if large.
2. **Identify what's needed** — Clarify the output format, required fields, calculations, and any cleaning steps before writing code.
3. **Process the data** — Write a script to do the work. Prefer a single script that reads input and writes output in one pass.
4. **Verify the output** — After generating output, read it back and spot-check values against the source data. Catch errors before delivering.

## CSV Processing

### Reading CSV files

Parse CSV properly — don't just split on commas, since values can contain commas inside quotes. For small datasets, reading and processing line-by-line is fine. For anything non-trivial, write a Python script using the `csv` module (it handles quoting, escaping, and edge cases correctly):

```python
import csv
with open('data.csv', newline='') as f:
    reader = csv.DictReader(f)
    rows = list(reader)
```

All values from CSV come in as strings. Convert numeric columns explicitly before doing math:
```python
amount = float(row['amount'])
quantity = int(row['quantity'])
revenue = amount * quantity  # compute derived values from source columns
```

### Writing CSV output

When producing CSV output, use the `csv` module to handle quoting correctly:
```python
import csv
with open('output.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['col1', 'col2'])
    writer.writeheader()
    writer.writerows(cleaned_rows)
```

Preserve the original column order from the input file. Don't add extra columns unless asked. Leave empty/missing fields as empty strings, not "N/A" or "None".

## Data Cleaning

When cleaning data, work methodically. Count issues *before* making changes (many tasks ask for a report of what was found, not just the cleaned output).

### Duplicates
Compare entire rows (all columns) to identify exact duplicates. Keep the first occurrence, remove subsequent ones. Count how many rows were removed.

### Missing values
A cell is "missing" if it's empty or contains only whitespace. Check every cell in every row. Count the total number of missing cells across the entire dataset (rows × columns), not just rows with missing data.

### Date standardization
Dates appear in many formats. Common ones to detect and convert to YYYY-MM-DD:
- `MM/DD/YYYY` (e.g., `01/20/2026`)
- `MM-DD-YYYY` (e.g., `02-05-2026`)
- `YYYY/MM/DD` (e.g., `2026/02/10`)
- `Month D YYYY` (e.g., `March 3 2026`)
- Already correct: `YYYY-MM-DD` — don't count these as "standardized"

Use `dateutil.parser` or manual pattern matching. Count only the dates that were actually converted, not ones already in the target format.

### Invalid emails
An email is malformed if it's missing the TLD (the part after the last dot in the domain). For example, `user@example` is invalid because `example` has no TLD like `.com`. Count these before deduplication.

### Cleaning workflow
```python
# 1. Read all rows
# 2. Count issues on the raw data (before any changes)
#    - missing values: scan every cell
#    - dates needing standardization: check date column
#    - invalid emails: check email column
# 3. Deduplicate (count removed rows)
# 4. Apply fixes (standardize dates, etc.)
# 5. Write cleaned data and report
```

The key insight: count issues on the original data, then clean. When counting "before dedup," scan all rows in the original file — but count each unique data point once. Duplicate rows represent the same record appearing multiple times, not distinct issues. For example, if a row with a non-standard date appears 3 times as duplicates, that's 1 date needing standardization, not 3. Similarly, a missing phone number on a duplicated row is 1 missing value, not multiple.

## Aggregation and Pivoting

When computing aggregations:

- **Group by**: Collect rows sharing the same key value, then compute aggregate functions (sum, count, mean) within each group.
- **Derived values**: If revenue = amount × quantity, compute this per-row first, then aggregate. Don't sum amounts and quantities separately and multiply the totals.
- **Sorting**: When asked to sort "descending", the largest value comes first. When asked for a "top" item, it's the one with the highest aggregate value.
- **Monthly breakdown**: Extract YYYY-MM from date columns, group by that key, sum the relevant metric within each group.

### Producing JSON output

Use `json.dumps()` with `indent=2` for readable output. Ensure numeric values are numbers (not strings) in the JSON:

```python
import json
report = {
    "total_revenue": 12500,        # number, not "12500"
    "top_category": "Electronics", # string
    "items": [                     # arrays of objects
        {"name": "A", "value": 100},
        {"name": "B", "value": 50}
    ]
}
with open('report.json', 'w') as f:
    json.dump(report, f, indent=2)
```

Match the exact field names requested. If the task says `total_revenue`, use that — not `totalRevenue` or `Total Revenue`.

## Verification

After generating output, always verify:
- Read the output file back and check a few values against manual calculation
- **Cross-check totals**: If you computed both a grand total and subtotals (e.g., monthly breakdown), verify they sum to the same number. If they don't, one of your computations has an error — find and fix it
- For JSON: ensure it's valid (parseable), field names match spec, numeric types are correct
- For CSV: ensure header matches, row count is right, no extra blank lines
- For counts/aggregations: spot-check at least one group's total by manually adding the source values
- For cleaning reports: verify counts by listing the specific items counted (e.g., "dates standardized: Bob 01/20/2026, Eve 2026/02/10, ..." — does the list length match the count?)
