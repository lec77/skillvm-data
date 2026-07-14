---
name: data-analyst
version: 1.0.0
description: LOAD THIS SKILL for any CSV, data cleaning, or JSON report task. Contains ready-to-use Python code patterns.
author: openclaw
---

# Data Analyst

Process CSV files with Python. Use `csv` and `json` modules (not pandas).

## CSV Aggregation

```python
import csv, json
from collections import defaultdict

with open('input.csv') as f:
    rows = list(csv.DictReader(f))

for r in rows:
    r['amount'] = float(r['amount'])
    r['quantity'] = int(r['quantity'])

totals = defaultdict(float)
for r in rows:
    totals[r['category']] += r['amount']

with open('output.json', 'w') as f:
    json.dump(result, f, indent=2)
```

## Data Cleaning

Follow these steps IN THIS EXACT ORDER:

```python
import csv, json, re
from datetime import datetime

# Step 1: Read all rows
with open('input.csv') as f:
    rows = list(csv.DictReader(f))

# Step 2: Deduplicate FIRST
seen = set()
unique = []
for r in rows:
    key = tuple(r.values())
    if key not in seen:
        seen.add(key)
        unique.append(r)
duplicates_removed = len(rows) - len(unique)

# Step 3: Count issues on UNIQUE rows only
missing_values = sum(1 for r in unique for v in r.values() if v.strip() == '')
invalid_emails = sum(1 for r in unique if r.get('email','').strip() and '@' in r['email'] and '.' not in r['email'].split('@')[1])
# Only count dates NOT already in YYYY-MM-DD format
dates_standardized = sum(1 for r in unique if r.get('signup_date','').strip() and not re.match(r'^\d{4}-\d{2}-\d{2}$', r['signup_date'].strip()))

# Step 4: Standardize all dates to YYYY-MM-DD
def parse_date(d):
    d = d.strip()
    if not d: return ''
    for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%m-%d-%Y', '%Y/%m/%d', '%B %d %Y']:
        try: return datetime.strptime(d, fmt).strftime('%Y-%m-%d')
        except ValueError: continue
    return d

for r in unique:
    d = r.get('signup_date','').strip()
    if d: r['signup_date'] = parse_date(d)

# Step 5: Write cleaned CSV
with open('cleaned_data.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=unique[0].keys())
    w.writeheader()
    w.writerows(unique)

# Step 6: Write cleaning report
with open('cleaning_report.json', 'w') as f:
    json.dump({'duplicates_removed': duplicates_removed, 'missing_values': missing_values, 'dates_standardized': dates_standardized, 'invalid_emails': invalid_emails}, f, indent=2)
```

## Rules

- Revenue = amount * quantity
- JSON: `json.dump(data, f, indent=2)`
- Keep rows with missing/invalid data, don't drop them
