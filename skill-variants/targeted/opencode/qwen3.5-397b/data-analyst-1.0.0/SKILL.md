---
name: data-analyst
version: 1.0.0
description: "CSV data analysis: aggregation, pivoting, cleaning, deduplication, and multi-dataset reporting with structured JSON output"
---

# Data Analyst

Analyze CSV files, clean data, compute aggregations, and produce structured JSON/CSV reports.

## CRITICAL RULES

1. **ALWAYS write a Python script** to read CSVs, compute values, and write output. NEVER manually compute numbers or hand-write JSON values — arithmetic errors are inevitable without code.
2. **Use exact field names** from the prompt in JSON output.
3. **Only dedup datasets the prompt explicitly says have duplicates.**

## Workflow

1. **Read the data** — Use Python's `csv.DictReader` to load CSV files. Examine structure, columns, row count.
2. **Plan** — Identify required output format, field names, calculations, cleaning steps.
3. **Process** — Write a single Python script that reads input and writes all outputs. Run it with `python3`.
4. **Verify** — Read output back and spot-check values against source data.

## CSV Processing Rules

**Always use Python's `csv` module** — never split on commas manually.

```python
import csv, json

with open('data.csv', newline='') as f:
    rows = list(csv.DictReader(f))
```

**Convert types explicitly** — all CSV values are strings:
```python
amount = float(row['amount'])
quantity = int(row['quantity'])
revenue = amount * quantity  # derive per-row, then aggregate
```

**JSON output** — use `json.dump()` with `indent=2`. Numeric values must be numbers, not strings. Match exact field names from the prompt.

```python
with open('output.json', 'w') as f:
    json.dump(result, f, indent=2)
```

## Aggregation & Pivoting

- **Derived values**: Compute per-row first (e.g., `revenue = amount * quantity`), then aggregate. Never multiply aggregated totals.
- **Group by**: Accumulate into dicts keyed by group value.
- **Monthly breakdown**: Extract `YYYY-MM` from date strings using `row['date'][:7]`, group and sum.
- **Sorting**: "descending" = largest first. "top" = highest aggregate value. "chronological" = earliest first.

## Data Cleaning

### CLEANING SCRIPT TEMPLATE

**WARNING: DO NOT count missing_values, dates_standardized, or invalid_emails by iterating over `rows`. You MUST iterate over `unique` (the deduplicated list) for ALL counts. The task prompt's phrase "before dedup" means "report what issues exist in the distinct records" — duplicate rows are copies of the same person so their issues must NOT be double-counted. If you iterate over `rows` instead of `unique`, your counts will be WRONG.**

Copy this script structure EXACTLY, only changing the input filename:

```python
import csv, json, re
from datetime import datetime

with open('input.csv', newline='') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    rows = list(reader)

# 1. Deduplicate FIRST
seen = set()
unique = []
dupes = 0
for row in rows:
    key = row['name'].strip().lower()
    if key in seen:
        dupes += 1
    else:
        seen.add(key)
        unique.append(row)

# 2. Count issues on unique rows ONLY (never iterate over `rows` for counting!)
missing = 0
for row in unique:
    for col in fieldnames:
        if not row.get(col, '').strip():
            missing += 1

dates_fixed = 0
for row in unique:
    d = row.get('signup_date', '').strip()
    if d and not re.match(r'^\d{4}-\d{2}-\d{2}$', d):
        dates_fixed += 1

invalid_emails = 0
for row in unique:
    email = row.get('email', '').strip()
    if email and not re.match(r'.+@.+\..+', email):
        invalid_emails += 1

# 3. Fix dates on unique rows
def fix_date(s):
    s = s.strip()
    if not s: return ''
    if re.match(r'^\d{4}-\d{2}-\d{2}$', s): return s
    for fmt in ['%m/%d/%Y', '%m-%d-%Y', '%Y/%m/%d', '%B %d %Y', '%B %d, %Y']:
        try: return datetime.strptime(s, fmt).strftime('%Y-%m-%d')
        except ValueError: pass
    return s

for row in unique:
    row['signup_date'] = fix_date(row.get('signup_date', ''))

# 4. Write outputs
with open('cleaned_data.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    w.writerows(unique)

with open('cleaning_report.json', 'w') as f:
    json.dump({'duplicates_removed': dupes, 'missing_values': missing,
               'dates_standardized': dates_fixed, 'invalid_emails': invalid_emails}, f, indent=2)
```

## Multi-Dataset Analysis

When analyzing multiple CSVs:
- **Only deduplicate datasets the prompt explicitly says have duplicates.** Do not dedup others.
- For dedup across datasets with no unique ID, compare entire rows: `tuple(sorted(row.items()))`.
- Write each analysis to its own JSON file.
- For cross-dataset reports, reference specific findings from each analysis.

### Dedup by full row (when no unique key)
```python
def dedup_rows(rows):
    seen = set()
    out = []
    for r in rows:
        k = tuple(sorted(r.items()))
        if k not in seen:
            seen.add(k)
            out.append(r)
    return out
```

### Customer churn/retention
- `Active` column: compare `row['Active'].strip().lower() == 'true'`
- Churn count = customers where Active is false
- Retention rate = (active / total) * 100

### Low stock identification
- Compare `int(row['Quantity']) < int(row['MinLevel'])` for each item
- Return array of SKU strings

## Verification Checklist

After generating output:
- Cross-check: if you have subtotals and a grand total, verify they sum correctly
- JSON: valid, parseable, field names match spec exactly, numbers are numbers
- CSV: correct header, correct row count, no extra blank lines
- Spot-check at least one aggregation by manual calculation
