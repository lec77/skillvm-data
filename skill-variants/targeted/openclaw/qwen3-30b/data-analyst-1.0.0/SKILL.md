---
name: data-analyst
version: 1.0.0
description: CSV data analysis, cleaning, and reporting with Python
author: openclaw
---

# Data Analyst

Analyze CSV files, clean data, and produce structured output (JSON, CSV).

## RULES

1. ALWAYS write a Python script and run it with `python3`. Never write output files directly. Never use `python` — always `python3`.
2. Use only Python standard library. No pandas.
3. Keep scripts SHORT. Never use f-strings. Use `print("done")` instead.
4. After running, verify output files exist.

## Pivot Analysis Script Template

Adapt this for CSV aggregation tasks. Change filenames and column names as needed:

```python
import csv, json
from collections import defaultdict
rows = list(csv.DictReader(open('INPUT.csv')))
grp = defaultdict(float)
for r in rows:
    grp[r['COL']] += float(r['amount']) * int(r['quantity'])
total = sum(grp.values())
top = max(grp, key=grp.get)
items = []
for k in sorted(grp, key=grp.get, reverse=True):
    items.append({'name': k, 'value': grp[k]})
json.dump({'total': total, 'top': top, 'items': items}, open('out.json','w'), indent=2)
print("done")
```

## Data Cleaning Script Template

Adapt this for CSV cleaning tasks. It handles dedup, missing values, date standardization, and email validation in one short script:

```python
import csv, json, re
from datetime import datetime
rows = list(csv.DictReader(open('INPUT.csv')))
cols = list(rows[0].keys())
# Count missing BEFORE dedup
missing = sum(1 for r in rows for v in r.values() if v.strip() == '')
# Count invalid emails BEFORE dedup
epat = re.compile(r'^[^@]+@[^@]+\.[^@]+$')
bad_em = sum(1 for r in rows if r['email'].strip() and not epat.match(r['email'].strip()))
# Standardize dates BEFORE dedup, count DISTINCT values converted
dfmts = ['%m/%d/%Y','%m-%d-%Y','%Y/%m/%d','%B %d %Y','%B %d, %Y']
dcol = 'signup_date'
fixed_dates = set()
for r in rows:
    d = r[dcol].strip()
    if not d or re.match(r'^\d{4}-\d{2}-\d{2}$', d):
        continue
    for f in dfmts:
        try:
            r[dcol] = datetime.strptime(d, f).strftime('%Y-%m-%d')
            fixed_dates.add(d)
            break
        except ValueError:
            pass
nfix = len(fixed_dates)
# Dedup
seen = set()
uniq = []
for r in rows:
    k = tuple(r[c] for c in cols)
    if k not in seen:
        seen.add(k)
        uniq.append(r)
nd = len(rows) - len(uniq)
# Write outputs
json.dump({'duplicates_removed':nd,'missing_values':missing,'dates_standardized':nfix,'invalid_emails':bad_em}, open('cleaning_report.json','w'), indent=2)
w = csv.DictWriter(open('cleaned_data.csv','w',newline=''), fieldnames=cols)
w.writeheader()
w.writerows(uniq)
print("done")
```

## Key Points

- Revenue = amount * quantity per row
- Group by month: use `date[:7]` for YYYY-MM
- Sort chronologically for dates, descending for rankings
- Count issues BEFORE dedup
- For dates_standardized: count DISTINCT date values that needed conversion (not per-row)
- Invalid email = no dot after @ (like `user@domain` vs `user@domain.com`)
- Standardize dates BEFORE dedup so duplicate detection uses normalized values
- Build lists with `.append()`, never inline dict comprehensions
