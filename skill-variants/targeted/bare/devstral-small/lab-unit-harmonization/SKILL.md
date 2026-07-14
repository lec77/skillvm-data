---
name: lab-unit-harmonization
description: Harmonize clinical lab data by converting mixed units to US conventional, fixing numeric formats. Always write and run a Python script.
---

# Lab Unit Harmonization

CRITICAL: Always write a Python script and execute it. NEVER compute values manually.

## Step 1: Parse numeric formats

```python
def parse_value(raw):
    if raw is None or str(raw).strip() in ('', 'NaN', 'NA', 'null', 'nan'):
        return None
    s = str(raw).strip().replace(',', '.')  # European decimal
    try:
        return float(s)  # handles scientific notation
    except ValueError:
        return None
```

## Step 2: Range-based unit detection and conversion

If a parsed value is OUTSIDE the US conventional range, multiply by the conversion factor:

| Analyte | Range (US) | Factor (to convert SI→US) |
|---|---|---|
| Serum_Creatinine | 0.2–20.0 mg/dL | × 0.0113 |
| Glucose | 30–500 mg/dL | ÷ 0.0555 (i.e. × 18.018) |
| Hemoglobin | 3–20 g/dL | × 0.1 |
| Total_Cholesterol | 50–400 mg/dL | ÷ 0.0259 (i.e. × 38.61) |
| Calcium | 4–15 mg/dL | ÷ 0.2495 (i.e. × 4.008) |
| BUN | 2–150 mg/dL | × 2.8 |
| Sodium | 100–180 mEq/L | × 1.0 |
| Potassium | 1.5–9.0 mEq/L | × 1.0 |
| Albumin | 1–6 g/dL | × 0.1 |
| Bilirubin | 0.05–30 mg/dL | × 0.0585 |

```python
CONFIG = {
    'Serum_Creatinine': (0.2, 20.0, 0.0113),
    'Glucose':          (30, 500, 1/0.0555),
    'Hemoglobin':       (3, 20, 0.1),
    'Total_Cholesterol': (50, 400, 1/0.0259),
    'Calcium':          (4, 15, 1/0.2495),
    'BUN':              (2, 150, 2.8),
    'Sodium':           (100, 180, 1.0),
    'Potassium':        (1.5, 9.0, 1.0),
    'Albumin':          (1, 6, 0.1),
    'Bilirubin':        (0.05, 30, 0.0585),
}

def harmonize(value, analyte):
    if value is None:
        return None
    lo, hi, factor = CONFIG[analyte]
    if not (lo <= value <= hi):
        value = value * factor
    return round(value, 2)
```

## Step 3: Format output

- Round all values to 2 decimal places using `f"{value:.2f}"`
- Write output CSV with exact same column names as input
- Use the EXACT output filename specified in the task prompt

## Complete Python script template

```python
import csv

def parse_value(raw):
    if raw is None or str(raw).strip() in ('', 'NaN', 'NA', 'null', 'nan'):
        return None
    s = str(raw).strip().replace(',', '.')
    try:
        return float(s)
    except ValueError:
        return None

CONFIG = {
    'Serum_Creatinine': (0.2, 20.0, 0.0113),
    'Glucose':          (30, 500, 1/0.0555),
    'Hemoglobin':       (3, 20, 0.1),
    'Total_Cholesterol': (50, 400, 1/0.0259),
    'Calcium':          (4, 15, 1/0.2495),
    'BUN':              (2, 150, 2.8),
    'Sodium':           (100, 180, 1.0),
    'Potassium':        (1.5, 9.0, 1.0),
    'Albumin':          (1, 6, 0.1),
    'Bilirubin':        (0.05, 30, 0.0585),
}

def harmonize(value, analyte):
    if value is None:
        return None
    lo, hi, factor = CONFIG[analyte]
    if not (lo <= value <= hi):
        value = value * factor
    return round(value, 2)

# Read input CSV
with open('INPUT.csv', 'r') as f:
    reader = csv.DictReader(f)
    rows = list(reader)
    analyte_cols = [c for c in reader.fieldnames if c != 'Patient_ID']

# Process each row
for row in rows:
    for col in analyte_cols:
        if col in CONFIG:
            val = parse_value(row[col])
            if val is not None:
                val = harmonize(val, col)
                row[col] = f"{val:.2f}"

# Write output CSV
with open('OUTPUT.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=reader.fieldnames)
    writer.writeheader()
    writer.writerows(rows)
```

## For quality reports

When asked to produce a quality report, also count issues:
- `mixed_units`: count of values that needed conversion (were outside range)
- `scientific_notation`: count of values containing 'e' or 'E'
- `european_decimal`: count of values containing ','
- `whitespace`: count of values where `str(raw) != str(raw).strip()`
- `excluded_rows`: count of rows with any empty/missing cell (exclude these from output)

Write `quality_report.json` with: `total_rows`, `excluded_rows`, `issues_found` (object with above counts).
Write `cleaned_labs.csv` with only non-missing rows, all values harmonized.
