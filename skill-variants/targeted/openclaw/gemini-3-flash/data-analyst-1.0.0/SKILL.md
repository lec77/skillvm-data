---
name: data-analyst
version: 1.0.0
description: "CSV data analysis: cleaning, aggregation, pivoting, and report generation using Python."
---

# Data Analyst

Process CSV files, clean data, compute aggregations, and produce structured JSON/CSV output.

## Workflow

1. **Read the data** — Open and examine the CSV file(s). Look at every row for small datasets.
2. **Plan** — Identify output format, required fields, calculations, and cleaning steps.
3. **Process** — Write a single Python script that reads input and writes all output files.
4. **Verify** — Read output files back and spot-check values against source data.

## CSV Processing with Python

Always use the `csv` module for reading and writing CSV:

```python
import csv, json

# Read
with open('data.csv', newline='') as f:
    rows = list(csv.DictReader(f))

# All CSV values are strings — convert before math
amount = float(row['amount'])
quantity = int(row['quantity'])
revenue = amount * quantity

# Write CSV
with open('output.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(cleaned)

# Write JSON
with open('report.json', 'w') as f:
    json.dump(result, f, indent=2)
```

## Data Cleaning

Work methodically. Count issues on the **original data before any changes**.

### Step-by-step cleaning process

```python
import csv
from dateutil import parser as dateparser

with open('input.csv', newline='') as f:
    rows = list(csv.DictReader(f))
fieldnames = list(rows[0].keys())

# 1. Count issues BEFORE dedup (on unique rows only)
#    - If a row appears 3 times, count its issues once (it's one record duplicated)
seen = set()
unique_for_counting = []
for row in rows:
    key = tuple(row[k] for k in fieldnames)
    if key not in seen:
        seen.add(key)
        unique_for_counting.append(row)

# Count missing values: empty or whitespace-only cells across ALL columns
missing_values = sum(1 for row in unique_for_counting for v in row.values() if not v or not v.strip())

# Count dates needing standardization (not already YYYY-MM-DD)
import re
yyyy_mm_dd = re.compile(r'^\d{4}-\d{2}-\d{2}$')
dates_standardized = 0
for row in unique_for_counting:
    date_val = row.get('signup_date', '').strip()
    if date_val and not yyyy_mm_dd.match(date_val):
        dates_standardized += 1

# Count invalid emails (missing TLD — no dot after @)
invalid_emails = 0
for row in unique_for_counting:
    email = row.get('email', '').strip()
    if email and '@' in email:
        domain = email.split('@')[1]
        if '.' not in domain:
            invalid_emails += 1

# 2. Deduplicate — keep first occurrence
seen = set()
deduped = []
duplicates_removed = 0
for row in rows:
    key = tuple(row[k] for k in fieldnames)
    if key in seen:
        duplicates_removed += 1
    else:
        seen.add(key)
        deduped.append(row)

# 3. Standardize dates
for row in deduped:
    date_val = row.get('signup_date', '').strip()
    if date_val and not yyyy_mm_dd.match(date_val):
        row['signup_date'] = dateparser.parse(date_val).strftime('%Y-%m-%d')

# 4. Write outputs
```

### Key rules
- **Duplicates**: Compare entire rows (all columns). Keep first, remove rest.
- **Missing values**: Empty or whitespace-only cells. Count total cells, not rows.
- **Dates**: Convert non-YYYY-MM-DD formats. Don't count already-correct dates.
- **Invalid emails**: Missing TLD means no dot in domain part (e.g., `user@example` is invalid).
- **Don't fabricate data**: Leave missing fields empty. Don't change invalid emails.

## Aggregation and Pivoting

When computing aggregations from CSV data:

```python
import csv, json
from collections import defaultdict

with open('sales.csv', newline='') as f:
    rows = list(csv.DictReader(f))

# Revenue = amount * quantity (compute per-row, then aggregate)
total_revenue = sum(float(r['amount']) * int(r['quantity']) for r in rows)

# Group by product
by_product = defaultdict(lambda: {'revenue': 0, 'quantity': 0})
for r in rows:
    rev = float(r['amount']) * int(r['quantity'])
    by_product[r['product']]['revenue'] += rev
    by_product[r['product']]['quantity'] += int(r['quantity'])

top_product = max(by_product, key=lambda p: by_product[p]['revenue'])

# Monthly breakdown — extract YYYY-MM from date
by_month = defaultdict(float)
for r in rows:
    month = r['date'][:7]  # "2026-01-15" -> "2026-01"
    by_month[month] += float(r['amount']) * int(r['quantity'])

monthly = [{'month': m, 'revenue': by_month[m]} for m in sorted(by_month)]
```

### Rules
- **Derived values**: Compute per-row first (revenue = amount × quantity), then sum. Never multiply aggregated totals.
- **Sorting**: "descending" = largest first. "top" = highest value.
- **JSON output**: Use exact field names from the spec. Numbers must be numbers, not strings.
- **Deduplication**: If told data has duplicates, remove them before computing aggregations.

## Multi-Dataset Analysis

When analyzing multiple CSV files:

1. Process each file independently — write each analysis JSON separately.
2. For cross-dataset reports, reference specific findings from each analysis.
3. Handle data quality issues (duplicates, date formats) in each file as needed.

```python
# After individual analyses, create cross-dataset report
report = {
    "summary": "Cross-dataset business analysis",
    "sales_insights": {"total_revenue": total_rev, "top_product": top_prod},
    "inventory_insights": {"low_stock_items": low_stock, "total_items": total_inv},
    "customer_insights": {"retention_rate": ret_rate, "churn_count": churn},
    "cross_references": "The top-selling product ... inventory levels ... customer segments ..."
}
```

## Verification Checklist

After generating output, always check:
- Read output file back, spot-check values against source
- Cross-check: subtotals should sum to grand total
- JSON: valid, correct field names, numbers are numbers not strings
- CSV: correct header, correct row count, no extra blank lines
- Counts: list the specific items you counted to verify the count matches
