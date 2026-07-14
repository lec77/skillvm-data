---
name: data-analyst
version: 1.0.0
description: "CSV data analysis: read CSV files, compute aggregations, clean data, and write JSON results."
---

# Data Analyst Skill

Analyze CSV data and produce JSON output files.

## Workflow

1. **List files** to see what CSV files are in the working directory
2. **Read each CSV** file to understand columns and data
3. **Write a Python script** to process the data and produce output
4. **Run the script** with `execute_command`
5. **Verify output** by reading the generated files

## Python CSV Analysis Pattern

Always use Python for data processing. Write a single script that does everything, then run it.

```python
import csv
import json
from collections import defaultdict

# Read CSV
with open('data.csv', 'r') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# Process data
total = sum(float(r['amount']) for r in rows)

# Write JSON output
with open('result.json', 'w') as f:
    json.dump({"total": total}, f, indent=2)
```

## Key Operations

### Remove duplicates
```python
seen = set()
unique_rows = []
for row in rows:
    key = tuple(row.values())
    if key not in seen:
        seen.add(key)
        unique_rows.append(row)
```

### Group by a column
```python
groups = defaultdict(list)
for row in rows:
    groups[row['category']].append(row)
```

### Aggregate (sum, count, average)
```python
# Sum
total = sum(float(r['amount']) for r in rows)
# Count
count = len(rows)
# Average
avg = total / count if count > 0 else 0
```

### Parse and standardize dates
```python
from datetime import datetime

def parse_date(s):
    """Try multiple date formats, return YYYY-MM-DD string."""
    s = s.strip()
    for fmt in ('%Y-%m-%d', '%m/%d/%Y', '%m-%d-%Y', '%Y/%m/%d', '%B %d %Y', '%B %d, %Y', '%b %d %Y', '%d/%m/%Y'):
        try:
            return datetime.strptime(s, fmt).strftime('%Y-%m-%d')
        except ValueError:
            continue
    return s  # return original if no format matches
```

### Count missing/empty values
```python
missing = 0
for row in rows:
    for val in row.values():
        if val is None or val.strip() == '':
            missing += 1
```

### Validate emails
```python
def is_valid_email(email):
    """Check if email has user@domain.tld format."""
    if not email or '@' not in email:
        return False
    parts = email.split('@')
    if len(parts) != 2:
        return False
    return '.' in parts[1]
```

### Sort results
```python
# Sort list of dicts by a key, descending
sorted_items = sorted(items, key=lambda x: x['value'], reverse=True)
```

### Revenue calculation (amount * quantity)
```python
revenue = sum(float(r['amount']) * int(r['quantity']) for r in rows)
```

### Monthly breakdown
```python
monthly = defaultdict(float)
for r in rows:
    month = r['date'][:7]  # YYYY-MM from YYYY-MM-DD
    monthly[month] += float(r['amount']) * int(r['quantity'])
monthly_list = [{"month": m, "revenue": v} for m, v in sorted(monthly.items())]
```

## Output Rules

- Always write output as JSON files using `json.dump()` with `indent=2`
- Use exact field names specified in the task prompt
- Numbers should be numeric types, not strings
- Arrays should be JSON arrays of objects
- Sort arrays as specified (chronologically for dates, descending for rankings)

## Important

- Always read the CSV files first to understand the actual data before writing analysis code
- Handle the case where numeric fields might have empty values
- When deduplicating, compare entire rows (all columns)
- Write one complete Python script that handles all processing, then run it
- After running the script, verify the output files exist and contain valid JSON
