---
name: lab-unit-harmonization
description: Harmonize clinical lab data by converting mixed units to US conventional, handling European decimals, scientific notation, and missing values.
---

# Lab Unit Harmonization

Convert mixed-unit lab CSV to US conventional units. Write a single Python script and run it.

## Complete Script Template

Use this script directly — adapt input/output filenames and column list as needed:

```python
import csv, json, math

CFG = {
    'Serum_Creatinine': (0.2, 20.0, 0.0113),
    'Glucose': (30, 500, 18.018),
    'Hemoglobin': (3, 20, 0.1),
    'Total_Cholesterol': (50, 400, 38.61),
    'Calcium': (4, 15, 4.008),
    'Sodium': (100, 180, 1.0),
    'Potassium': (1.5, 9.0, 1.0),
    'BUN': (2, 150, 2.8),
}

def parse(raw):
    s = raw.strip()
    if s in ('', 'NaN', 'NA', 'null', 'nan'):
        return None
    s = s.replace(',', '.')
    try:
        return float(s)
    except:
        return None

def harmonize(val, lo, hi, f):
    if not (lo <= val <= hi):
        val = val * f
    return round(val, 2)

with open('INPUT.csv') as f:
    reader = csv.DictReader(f)
    rows = list(reader)
    analytes = [c for c in reader.fieldnames if c in CFG]

issues = {'mixed_units': 0, 'scientific_notation': 0, 'european_decimal': 0, 'whitespace': 0}
clean = []

for row in rows:
    skip = False
    parsed = {'Patient_ID': row['Patient_ID']}
    for col in analytes:
        raw = row[col]
        val = parse(raw)
        if val is None:
            skip = True
            break
        if 'e' in raw.lower() or 'E' in raw:
            issues['scientific_notation'] += 1
        if ',' in raw:
            issues['european_decimal'] += 1
        if raw != raw.strip():
            issues['whitespace'] += 1
        lo, hi, f = CFG[col]
        if not (lo <= val <= hi):
            issues['mixed_units'] += 1
        parsed[col] = harmonize(val, lo, hi, f)
    if not skip:
        clean.append(parsed)

# Write quality report
report = {
    'total_rows': len(rows),
    'excluded_rows': len(rows) - len(clean),
    'issues_found': issues
}
with open('quality_report.json', 'w') as f:
    json.dump(report, f, indent=2)

# Write cleaned CSV
with open('OUTPUT.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=['Patient_ID'] + analytes)
    w.writeheader()
    w.writerows(clean)
```

**Key rules:**
- Parse: strip whitespace, replace `,` with `.`, then `float()`
- If value is outside US range → multiply by conversion factor
- Round all values to 2 decimal places
- Exclude any row with missing/empty values
- Use only `csv` and `json` stdlib — no pandas needed
