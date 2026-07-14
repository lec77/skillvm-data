---
name: lab-unit-harmonization
description: Harmonize clinical lab data by converting mixed units to US conventional, handling scientific notation, European decimals, and missing values.
---

# Lab Unit Harmonization

## Strategy

To process lab CSV files, write a Python script and run it with `execute_command`. Use `execute_command` with `cat` to read CSV files instead of `read_file`.

**Step 1:** Read the CSV file: `execute_command({"command": "cat input.csv"})`
**Step 2:** Write a Python script using `write_file` that does all processing
**Step 3:** Run it: `execute_command({"command": "python3 script.py"})`

## Conversion Rules

Parse each value: strip whitespace, replace comma with dot (European decimal), then float().

If value is outside the US conventional range, multiply by the conversion factor:

| Analyte | Range (US) | Factor |
|---|---|---|
| Serum_Creatinine | 0.2–20.0 mg/dL | × 0.0113 |
| Glucose | 30–500 mg/dL | × 18.018 |
| Hemoglobin | 3–20 g/dL | × 0.1 |
| Total_Cholesterol | 50–400 mg/dL | × 38.61 |
| Calcium | 4–15 mg/dL | × 4.008 |
| BUN | 2–150 mg/dL | × 2.8 |
| Sodium | 100–180 mEq/L | × 1.0 |
| Potassium | 1.5–9.0 mEq/L | × 1.0 |

Round all converted values to 2 decimal places.

## Complete Python Script Template

```python
import csv, json, re, sys, os

CONFIG = {
    'Serum_Creatinine': (0.2, 20.0, 0.0113),
    'Glucose': (30, 500, 18.018),
    'Hemoglobin': (3, 20, 0.1),
    'Total_Cholesterol': (50, 400, 38.61),
    'Calcium': (4, 15, 4.008),
    'BUN': (2, 150, 2.8),
    'Sodium': (100, 180, 1.0),
    'Potassium': (1.5, 9.0, 1.0),
}

def parse_value(raw):
    if raw is None:
        return None
    s = str(raw).strip()
    if s in ('', 'NaN', 'NA', 'null', 'nan'):
        return None
    s = s.replace(',', '.')
    try:
        return float(s)
    except ValueError:
        return None

def harmonize(value, analyte):
    if value is None or analyte not in CONFIG:
        return value
    lo, hi, factor = CONFIG[analyte]
    if not (lo <= value <= hi):
        value = value * factor
    return round(value, 2)

def process(input_file, output_csv, report_file=None):
    with open(input_file, 'r') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        rows = list(reader)

    total_rows = len(rows)
    analyte_cols = [h for h in headers if h in CONFIG]

    # Track issues before excluding
    issues = {'mixed_units': 0, 'scientific_notation': 0, 'european_decimal': 0, 'whitespace': 0}

    # Find rows with missing values
    excluded = []
    clean_rows = []
    for row in rows:
        has_missing = False
        for col in analyte_cols:
            val = row.get(col, '')
            s = str(val).strip()
            if s in ('', 'NaN', 'NA', 'null', 'nan'):
                has_missing = True
                break
        if has_missing:
            excluded.append(row)
        else:
            clean_rows.append(row)

    # Process clean rows
    for row in clean_rows:
        for col in analyte_cols:
            raw = row[col]
            s = str(raw)
            if ',' in s:
                issues['european_decimal'] += 1
            if 'e' in s.lower() and any(c.isdigit() for c in s):
                issues['scientific_notation'] += 1
            if s != s.strip():
                issues['whitespace'] += 1
            val = parse_value(raw)
            if val is not None:
                lo, hi, factor = CONFIG[col]
                if not (lo <= val <= hi):
                    issues['mixed_units'] += 1
                val = harmonize(val, col)
                row[col] = "%.2f" % val

    # Write cleaned CSV
    with open(output_csv, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(clean_rows)

    # Write quality report if requested
    if report_file:
        report = {
            'total_rows': total_rows,
            'excluded_rows': len(excluded),
            'issues_found': issues
        }
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)

    print("Done: %d clean rows, %d excluded" % (len(clean_rows), len(excluded)))

if __name__ == '__main__':
    # Adjust filenames as needed
    input_csv = sys.argv[1] if len(sys.argv) > 1 else 'input.csv'
    output_csv = sys.argv[2] if len(sys.argv) > 2 else 'output.csv'
    report_json = sys.argv[3] if len(sys.argv) > 3 else None
    process(input_csv, output_csv, report_json)
```

## Usage Examples

**Harmonize only (no report):**
```
python3 script.py lab_data.csv harmonized_labs.csv
```

**With quality report:**
```
python3 script.py raw_labs.csv cleaned_labs.csv quality_report.json
```
