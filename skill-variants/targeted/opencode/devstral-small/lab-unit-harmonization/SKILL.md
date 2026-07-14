---
name: lab-unit-harmonization
description: Convert clinical lab values to US conventional units. Use when processing lab CSV data with mixed units, scientific notation, or European decimals.
---

# Lab Unit Harmonization

Write a Python script. Read CSV, process values, write output files.

## Step 1: Parse numeric values

```python
def parse_val(raw):
    s = str(raw).strip()
    if s in ('', 'NaN', 'NA', 'null', 'nan'):
        return None
    s = s.replace(',', '.')
    return float(s)
```

## Step 2: Convert units via range check

If value is outside the US conventional range, multiply by the conversion factor.

```python
CONFIG = {
    'Serum_Creatinine':  (0.2, 20.0, 0.0113),
    'Glucose':           (30, 500, 1/0.0555),
    'Hemoglobin':        (3, 20, 0.1),
    'Total_Cholesterol': (50, 400, 1/0.0259),
    'Calcium':           (4, 15, 1/0.2495),
    'BUN':               (2, 150, 2.8),
    'Albumin':           (1, 6, 0.1),
    'Bilirubin':         (0.05, 30, 0.0585),
    'Sodium':            (100, 180, 1.0),
    'Potassium':         (1.5, 9.0, 1.0),
}

def convert(val, analyte):
    if val is None:
        return None
    lo, hi, factor = CONFIG[analyte]
    if not (lo <= val <= hi):
        val = val * factor
    return round(val, 2)
```

## Step 3: Process CSV

```python
import csv, json

def process_lab_csv(input_file, output_csv, report_json=None):
    with open(input_file) as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        rows = list(reader)

    analytes = [h for h in headers if h in CONFIG]
    total = len(rows)
    excluded = []
    cleaned = []
    issues = {'mixed_units': 0, 'scientific_notation': 0, 'european_decimal': 0, 'whitespace': 0}

    for row in rows:
        missing = False
        for a in analytes:
            raw = row[a]
            s = str(raw).strip()
            if s in ('', 'NaN', 'NA', 'null', 'nan'):
                missing = True
                break
        if missing:
            excluded.append(row)
            continue

        for a in analytes:
            raw = row[a]
            s = str(raw)
            if s != s.strip():
                issues['whitespace'] += 1
            if ',' in s:
                issues['european_decimal'] += 1
            if 'e' in s.lower() and any(c.isdigit() for c in s):
                issues['scientific_notation'] += 1
            val = parse_val(raw)
            lo, hi, factor = CONFIG[a]
            if val is not None and not (lo <= val <= hi):
                issues['mixed_units'] += 1
            row[a] = str(convert(val, a))
        cleaned.append(row)

    with open(output_csv, 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=headers)
        w.writeheader()
        w.writerows(cleaned)

    if report_json:
        report = {
            'total_rows': total,
            'excluded_rows': len(excluded),
            'issues_found': issues
        }
        with open(report_json, 'w') as f:
            json.dump(report, f, indent=2)

    return cleaned, issues
```

## Usage

For harmonization only:
```python
process_lab_csv('lab_data.csv', 'harmonized_labs.csv')
```

For harmonization with quality report:
```python
process_lab_csv('raw_labs.csv', 'cleaned_labs.csv', 'quality_report.json')
```
