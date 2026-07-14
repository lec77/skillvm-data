---
name: data-analyst
version: 1.0.0
description: "CSV data analysis, cleaning, aggregation, and JSON report generation."
author: openclaw
---

# Data Analyst Skill

Analyze CSV files, clean data, compute aggregations, and produce JSON reports.

## CSV Analysis Workflow

1. **Read** the CSV file and understand columns/types
2. **Clean** — remove duplicates, standardize formats, handle missing values
3. **Analyze** — compute aggregations, groupings, summaries
4. **Output** — write results as JSON files with exact field names requested

## Reading CSV Data

Parse CSV files line by line. First line is the header. Split on commas.

When computing derived values like revenue from `amount` and `quantity` columns, multiply: `revenue = amount * quantity`.

## Data Cleaning

### Data Cleaning Algorithm

Use this exact algorithm when cleaning data and generating a cleaning report:

```python
import csv, re, json

rows = list(csv.DictReader(open('input.csv')))
original_count = len(rows)

# Step 1: Deduplicate — remove exact duplicate rows
seen = set()
unique_rows = []
for row in rows:
    key = tuple(row.values())
    if key not in seen:
        seen.add(key)
        unique_rows.append(row)
duplicates_removed = original_count - len(unique_rows)

# Step 2: Count issues on UNIQUE rows only (after dedup)
dates_standardized = 0
missing_values = 0
invalid_emails = 0
for row in unique_rows:
    for col, val in row.items():
        if val is None or val.strip() == '':
            missing_values += 1
    # Count non-YYYY-MM-DD dates
    date_val = row.get('signup_date', '').strip()
    if date_val and not re.match(r'^\d{4}-\d{2}-\d{2}$', date_val):
        dates_standardized += 1
    # Count invalid emails (no dot after @)
    email = row.get('email', '').strip()
    if email and '@' in email and '.' not in email.split('@')[1]:
        invalid_emails += 1

# Step 3: Standardize dates and write output
# ... convert dates to YYYY-MM-DD, write cleaned CSV
```

Key rules:
- `duplicates_removed` = rows removed during dedup
- All other counts (`missing_values`, `dates_standardized`, `invalid_emails`) are counted on the **unique rows after dedup**, NOT on the original data
- Do not fabricate data for missing fields — leave them empty
- Do not alter invalid email values

### Date Formats to Standardize
- `MM/DD/YYYY` → `YYYY-MM-DD`
- `MM-DD-YYYY` → `YYYY-MM-DD`
- `YYYY/MM/DD` → `YYYY-MM-DD`
- `Month D YYYY` → `YYYY-MM-DD` (e.g., `March 3 2026` → `2026-03-03`)

## Aggregation Patterns

### Grouping and Summing
Group rows by a column (e.g., product, region, month) and sum numeric columns within each group.

### Finding Top Items
After computing totals per group, the "top" item is the one with the highest total.

### Monthly Breakdown
Extract `YYYY-MM` from date column. Group by month, sum revenue. Sort chronologically.

### Product/Category Summary
Group by product/category. Compute total_revenue and total_quantity per group. Sort by total_revenue descending.

## JSON Output

Always write valid JSON. Use exact field names from the task prompt. Example structure:

```json
{
  "total_revenue": 42100,
  "top_product": "Laptop",
  "top_region": "North",
  "monthly_breakdown": [
    {"month": "2026-01", "revenue": 8150}
  ],
  "product_summary": [
    {"product": "Laptop", "total_revenue": 18000, "total_quantity": 15}
  ]
}
```

Numbers should be numeric (not strings). Arrays should be sorted as specified.

## Multi-Dataset Analysis

When analyzing multiple CSV files:
1. Process each dataset independently first
2. Write separate analysis JSON files for each dataset
3. Then create a cross-dataset report that references findings from all analyses
4. The cross-dataset report should mention concepts from each dataset (e.g., sales/revenue, inventory/stock, customer/churn)

## Cleaning Report Format

```json
{
  "duplicates_removed": 3,
  "missing_values": 4,
  "dates_standardized": 5,
  "invalid_emails": 2
}
```

IMPORTANT: `duplicates_removed` counts removed rows. All other counts (`missing_values`, `dates_standardized`, `invalid_emails`) are computed AFTER deduplication on the remaining unique rows only.
