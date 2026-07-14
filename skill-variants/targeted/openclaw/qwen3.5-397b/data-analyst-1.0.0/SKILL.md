---
name: data-analyst
version: 1.0.0
description: "Data analysis, CSV/spreadsheet processing, data cleaning, aggregation, and report generation. Use this skill whenever the user wants to analyze data files (CSV, TSV, Excel), clean messy data, compute summaries or aggregations, pivot data, generate reports from datasets, or produce structured output (JSON, CSV) from raw data."
---

# Data Analyst

Analyze data files, clean messy datasets, compute aggregations, and produce structured reports.

## Workflow

1. **Read the data** — Examine the file. For small datasets (<100 rows), read every row.
2. **Plan** — Identify output format, required fields, calculations, and cleaning steps.
3. **Process** — Write a single Python script that reads input and writes output.
4. **Verify** — Read output back, spot-check values against source data.

## CSV Processing

Always use Python's `csv` module — never split on commas manually:

```python
import csv
with open('data.csv', newline='') as f:
    reader = csv.DictReader(f)
    rows = list(reader)
```

All CSV values are strings. Convert before math:
```python
amount = float(row['amount'])
quantity = int(row['quantity'])
revenue = amount * quantity  # per-row derived value
```

### Writing CSV
```python
import csv
with open('output.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['col1', 'col2'])
    writer.writeheader()
    writer.writerows(rows)
```

Preserve original column order. Leave missing fields as empty strings.

## Data Cleaning

Work methodically. Count issues **before** making changes.

### Duplicates
Compare entire rows (all columns). Keep first occurrence, remove subsequent. Count removed rows.

### Missing values
A cell is "missing" if empty or whitespace-only. Count total missing cells across the entire dataset. When counting "before dedup," count each **unique** record's issues once — if a row with a missing phone appears 3 times as duplicates, that's 1 missing value, not 3.

### Date standardization
Convert to YYYY-MM-DD. Common formats:
- `MM/DD/YYYY` → `01/20/2026`
- `MM-DD-YYYY` → `02-05-2026`
- `YYYY/MM/DD` → `2026/02/10`
- `Month D YYYY` → `March 3 2026`

Don't count dates already in YYYY-MM-DD format. When counting "before dedup," count each unique record's dates once.

Use `dateutil.parser.parse` or manual pattern matching for conversion.

### Invalid emails
An email is malformed if missing a TLD (no dot after `@`). Example: `user@example` is invalid (no `.com`). Count before dedup, counting unique records only.

### Cleaning order
```
1. Read all rows
2. Count issues on UNIQUE rows only (deduplicate first conceptually):
   - missing values: scan every cell of each unique row
   - dates needing conversion: check date column of each unique row
   - invalid emails: check email column of each unique row
3. Remove duplicate rows (count how many removed)
4. Standardize dates on remaining rows
5. Write cleaned CSV and report JSON
```

## Aggregation and Pivoting

- **Derived values first**: If revenue = amount × quantity, compute per-row, then aggregate. Never multiply summed amounts by summed quantities.
- **Group by**: Collect rows by key, compute sum/count/mean within each group.
- **Sorting**: "descending" = largest first. "top" = highest aggregate value.
- **Monthly breakdown**: Extract `YYYY-MM` from date, group and sum by that key.

### JSON output
```python
import json
result = {"total": 12500, "items": [{"name": "A", "value": 100}]}
with open('report.json', 'w') as f:
    json.dump(result, f, indent=2)
```

Use exact field names as requested. Ensure numbers are numbers (not strings).

## Verification

After generating output:
- Read output file back and spot-check values
- Cross-check: if you have subtotals and a grand total, verify they match
- For JSON: valid, correct field names, numeric types
- For CSV: correct header, correct row count, no extra blank lines
- For counts: list the specific items you counted to verify the total matches
