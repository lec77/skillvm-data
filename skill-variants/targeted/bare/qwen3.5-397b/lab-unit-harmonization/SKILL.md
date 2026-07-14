---
name: lab-unit-harmonization
description: Harmonize clinical lab data by converting between US conventional and SI units, standardizing numeric formats, and validating against reference ranges.
---

# Lab Unit Harmonization

Convert multi-source lab data to US conventional units using range-based detection.

## Parsing Rules

1. Strip whitespace: `str(raw).strip()`
2. Replace European comma decimal: `s.replace(',', '.')` BEFORE `float()`
3. `float()` handles scientific notation (`1.26e2` → `126.0`) natively
4. Missing values: empty string, `NaN`, `NA`, `null`, `nan` → `np.nan`

## Range-Based Unit Conversion

If a parsed value falls **outside** the expected US range → multiply by conversion factor.

| Analyte | US Unit | Range | Alt Unit | Factor |
|---|---|---|---|---|
| Serum_Creatinine | mg/dL | 0.2–20.0 | µmol/L | ×0.0113 |
| Glucose | mg/dL | 30–500 | mmol/L | ×18.018 (÷0.0555) |
| Hemoglobin | g/dL | 3–20 | g/L | ×0.1 |
| Total_Cholesterol | mg/dL | 50–400 | mmol/L | ×38.61 (÷0.0259) |
| Calcium | mg/dL | 4–15 | mmol/L | ×4.008 (÷0.2495) |
| Sodium | mEq/L | 100–180 | mmol/L | ×1.0 |
| Potassium | mEq/L | 1.5–9.0 | mmol/L | ×1.0 |
| BUN | mg/dL | 2–150 | mmol/L | ×2.8 |
| Albumin | g/dL | 1–6 | g/L | ×0.1 |
| Bilirubin | mg/dL | 0.05–30 | µmol/L | ×0.0585 |

## Pipeline

```python
import pandas as pd, numpy as np

ANALYTE_CONFIG = {
    'Serum_Creatinine': {'lo': 0.2, 'hi': 20.0, 'factor': 0.0113},
    'Glucose':          {'lo': 30,  'hi': 500,   'factor': 1/0.0555},
    'Hemoglobin':       {'lo': 3,   'hi': 20,    'factor': 0.1},
    'Total_Cholesterol':{'lo': 50,  'hi': 400,   'factor': 1/0.0259},
    'Calcium':          {'lo': 4,   'hi': 15,    'factor': 1/0.2495},
    'Sodium':           {'lo': 100, 'hi': 180,   'factor': 1.0},
    'Potassium':        {'lo': 1.5, 'hi': 9.0,   'factor': 1.0},
    'BUN':              {'lo': 2,   'hi': 150,   'factor': 2.8},
    'Albumin':          {'lo': 1,   'hi': 6,     'factor': 0.1},
    'Bilirubin':        {'lo': 0.05,'hi': 30,    'factor': 0.0585},
}

def parse_lab_value(raw):
    if pd.isna(raw) or str(raw).strip() in ('', 'NaN', 'NA', 'null', 'nan'):
        return np.nan
    s = str(raw).strip().replace(',', '.')
    try:
        return float(s)
    except ValueError:
        return np.nan

def harmonize_value(value, analyte):
    if pd.isna(value):
        return np.nan
    cfg = ANALYTE_CONFIG[analyte]
    if not (cfg['lo'] <= value <= cfg['hi']):
        value = value * cfg['factor']
    return round(value, 2)

def harmonize_dataframe(df, analytes):
    issues = {'mixed_units': 0, 'scientific_notation': 0, 'european_decimal': 0, 'whitespace': 0}
    for col in analytes:
        if col not in df.columns:
            continue
        for idx, raw in df[col].items():
            s = str(raw)
            if ',' in s: issues['european_decimal'] += 1
            if any(c in s.lower() for c in ('e+', 'e-', 'e')): issues['scientific_notation'] += 1
            if s != s.strip(): issues['whitespace'] += 1
            val = parse_lab_value(raw)
            cfg = ANALYTE_CONFIG.get(col)
            if cfg and not pd.isna(val):
                if not (cfg['lo'] <= val <= cfg['hi']): issues['mixed_units'] += 1
                val = harmonize_value(val, col)
            df.at[idx, col] = val
    return df, issues
```

## Quality Report Pattern

- Exclude rows with ANY missing analyte value before harmonization
- Count excluded rows separately from issue counts
- Output: `quality_report.json` with `total_rows`, `excluded_rows`, `issues_found`
- Output: `cleaned_labs.csv` with only complete rows, all values rounded to 2 decimal places
- Use `encoding='utf-8'` for CSV to handle µ symbols
