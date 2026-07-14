---
name: lab-unit-harmonization
description: Harmonize clinical laboratory data from multiple sources by converting between US conventional and SI units, standardizing numeric formats, and validating against clinical reference ranges. Use when processing multi-source healthcare lab data with mixed units, scientific notation, or European decimal formats.
---

# Lab Unit Harmonization

## Overview

Clinical laboratory data from multiple sources frequently contains mixed unit systems, inconsistent numeric formatting, and values requiring conversion to a single standard. This skill covers the complete pipeline for parsing, detecting, converting, and validating lab values so that downstream analytics operate on a consistent dataset.

## Common Data Quality Issues

### Mixed Units
Values for the same analyte may arrive in different unit systems depending on the laboratory's country or instrumentation:
- Serum creatinine may appear as mg/dL (US) or µmol/L (SI)
- Glucose may appear as mg/dL (US) or mmol/L (SI)
- Hemoglobin may appear as g/dL or g/L
- Cholesterol may appear as mg/dL or mmol/L

### Numeric Format Variations
- **Scientific notation**: `1.26e2` or `1.26E+02` (common in instrument exports)
- **European decimal format**: `12,34` (comma as decimal separator, common in German/French labs)
- **Whitespace**: leading/trailing spaces around numeric strings: `"  12.5  "`
- **Missing values**: empty strings, `NaN`, `NA`, `null`, or `-999` sentinel values

## Unit Conversion via Range-Based Detection

The core technique is **range-based unit detection**: if a value falls outside the expected range for its analyte in US conventional units, apply the appropriate conversion factor. This avoids requiring an explicit unit column and handles unlabeled mixed-unit datasets.

**Algorithm:**
1. Parse the raw string to a float (handle scientific notation, European decimals, whitespace)
2. Check if the parsed value is within the US conventional reference range for the analyte
3. If outside the range, apply the conversion factor to map from the alternative unit to US conventional
4. Round the result to 2 decimal places
5. If the value is still outside range after conversion, flag as a potential outlier

## Reference Table: Key Lab Conversions

| Analyte | US Conventional (target) | Expected Range (mg/dL or mEq/L) | Alternative Unit | Conversion Factor |
|---|---|---|---|---|
| Serum_Creatinine | mg/dL | 0.2 – 20.0 | µmol/L | × 0.0113 |
| Glucose | mg/dL | 30 – 500 | mmol/L | ÷ 0.0555 (× 18.018) |
| Hemoglobin | g/dL | 3 – 20 | g/L | × 0.1 |
| Total_Cholesterol | mg/dL | 50 – 400 | mmol/L | ÷ 0.0259 (× 38.61) |
| Calcium | mg/dL | 4 – 15 | mmol/L | ÷ 0.2495 (× 4.008) |
| Sodium | mEq/L | 100 – 180 | mmol/L | × 1.0 (equivalent) |
| Potassium | mEq/L | 1.5 – 9.0 | mmol/L | × 1.0 (equivalent) |
| BUN | mg/dL | 2 – 150 | mmol/L | × 2.8 |
| Albumin | g/dL | 1 – 6 | g/L | × 0.1 |
| Bilirubin | mg/dL | 0.05 – 30 | µmol/L | × 0.0585 |

**Note:** Sodium and Potassium are already equivalent between mmol/L and mEq/L (factor = 1.0), so range-based detection still applies to catch transcription errors or true outliers.

## Harmonization Workflow

```
Raw CSV
  │
  ▼
1. PARSE NUMERIC FORMAT
   - Strip whitespace: str.strip()
   - Replace European comma decimal: str.replace(',', '.')
   - Parse scientific notation: float() handles 1.5e3 natively after above steps
   - Handle missing: check for empty string, NaN, NA before parsing
  │
  ▼
2. DETECT UNIT via RANGE CHECK
   - For each analyte, check: lo ≤ value ≤ hi
   - If outside range → apply conversion factor
   - Apply rounding: round(value, 2)
  │
  ▼
3. VALIDATE
   - After conversion, re-check range
   - Flag extreme outliers or failed conversions
  │
  ▼
4. OUTPUT
   - Write cleaned CSV with standardized values (2 decimal places)
   - Optionally write a quality report JSON with issue counts
```

## Python Code Patterns

### Parsing Mixed Numeric Formats

```python
import pandas as pd
import numpy as np

def parse_lab_value(raw):
    """Parse a lab value string handling scientific notation, European decimals, whitespace."""
    if pd.isna(raw) or str(raw).strip() in ('', 'NaN', 'NA', 'null', 'nan'):
        return np.nan
    s = str(raw).strip()
    s = s.replace(',', '.')  # European decimal: "12,34" -> "12.34"
    try:
        return float(s)  # handles scientific notation like "1.26e2"
    except ValueError:
        return np.nan
```

### Range-Based Unit Conversion

```python
ANALYTE_CONFIG = {
    'Serum_Creatinine': {'lo': 0.2, 'hi': 20.0, 'factor': 0.0113},    # µmol/L -> mg/dL
    'Glucose':          {'lo': 30,  'hi': 500,   'factor': 1/0.0555},   # mmol/L -> mg/dL
    'Hemoglobin':       {'lo': 3,   'hi': 20,    'factor': 0.1},        # g/L -> g/dL
    'Total_Cholesterol':{'lo': 50,  'hi': 400,   'factor': 1/0.0259},   # mmol/L -> mg/dL
    'Calcium':          {'lo': 4,   'hi': 15,    'factor': 1/0.2495},   # mmol/L -> mg/dL
    'Sodium':           {'lo': 100, 'hi': 180,   'factor': 1.0},        # mmol/L -> mEq/L
    'Potassium':        {'lo': 1.5, 'hi': 9.0,   'factor': 1.0},        # mmol/L -> mEq/L
    'BUN':              {'lo': 2,   'hi': 150,   'factor': 2.8},         # mmol/L -> mg/dL
}

def harmonize_value(value, analyte):
    """Convert value to US conventional units using range-based detection."""
    if pd.isna(value):
        return np.nan
    cfg = ANALYTE_CONFIG[analyte]
    if not (cfg['lo'] <= value <= cfg['hi']):
        value = value * cfg['factor']
    return round(value, 2)
```

### Full Pipeline with Pandas

```python
def harmonize_dataframe(df, analytes):
    """Harmonize all analyte columns in a DataFrame."""
    issue_counts = {'mixed_units': 0, 'scientific_notation': 0,
                    'european_decimal': 0, 'whitespace': 0}

    for col in analytes:
        if col not in df.columns:
            continue
        for idx, raw in df[col].items():
            s = str(raw)
            if ',' in s:
                issue_counts['european_decimal'] += 1
            if any(c in s.lower() for c in ('e+', 'e-', 'e')):
                issue_counts['scientific_notation'] += 1
            if s != s.strip():
                issue_counts['whitespace'] += 1

            val = parse_lab_value(raw)
            cfg = ANALYTE_CONFIG.get(col)
            if cfg and not pd.isna(val):
                if not (cfg['lo'] <= val <= cfg['hi']):
                    issue_counts['mixed_units'] += 1
                val = harmonize_value(val, col)
            df.at[idx, col] = val

    return df, issue_counts
```

### Quality Report

```python
def generate_quality_report(df, analytes):
    """Identify missing rows, issue counts, and write cleaned output."""
    # Exclude rows with any missing value
    missing_mask = df[analytes].isna().any(axis=1)
    excluded_rows = int(missing_mask.sum())
    clean_df = df[~missing_mask].copy()

    # Harmonize the clean subset
    clean_df, issue_counts = harmonize_dataframe(clean_df, analytes)

    report = {
        'total_rows': len(df),
        'excluded_rows': excluded_rows,
        'issues_found': issue_counts,
    }
    return report, clean_df
```

## Tips and Edge Cases

- **Creatinine**: µmol/L values are typically 44–1000+; applying × 0.0113 maps them to 0.5–11+ mg/dL
- **Glucose**: mmol/L values are typically 2–40; applying ÷ 0.0555 maps them to 36–720 mg/dL
- **Hemoglobin**: g/L values are typically 30–200; applying × 0.1 maps them to 3–20 g/dL
- **Cholesterol**: mmol/L values are typically 1–15; applying ÷ 0.0259 maps them to 39–579 mg/dL
- **Scientific notation** in CSV: `1.26e2` parses to `126.0` — Python's `float()` handles this after comma replacement
- **European decimals**: Replace `,` with `.` BEFORE calling `float()` — `"12,34"` → `"12.34"` → `12.34`
- **Column encoding**: Always decode CSV with `encoding='utf-8'` or `'latin-1'` to avoid µ symbol issues

## Quick Reference: Step-by-Step Checklist

When writing output files directly (without running a script):

1. For EVERY numeric value in EVERY column, parse it: strip spaces, replace commas with periods, handle scientific notation
2. Check if the parsed value is in the US range for that analyte (see table above)
3. If OUTSIDE range: multiply by the conversion factor. Example: creatinine 97.0 > 20.0 → 97.0 × 0.0113 = 1.10
4. Round ALL values to 2 decimal places: write "1.20" not "1.2"
5. Missing row = a row where any analyte cell is completely empty (contains no text between commas like `,,`). A value of 0 or out-of-range is NOT missing.
6. total_rows = number of data rows in the CSV file. If the file says "total 31 lines", subtract 1 for the header → total_rows = 30.
7. JSON must have proper structure with ALL closing braces. Use this exact template:

```json
{
  "total_rows": 30,
  "excluded_rows": 3,
  "issues_found": {
    "mixed_units": 10,
    "scientific_notation": 4,
    "european_decimal": 4,
    "whitespace": 3
  }
}
```

Note the closing `}` on the last two lines — both are required.

### Detecting Empty Cells in CSV

Look for consecutive commas or trailing/leading empty fields in the raw CSV:
- `P010,1.20,110,,190` → the `,,` after 110 means the 4th column is EMPTY → exclude P010
- `P020,0.90,,14.0` → the `,,` after 0.90 means the 3rd column is EMPTY → exclude P020
- If the last analyte column is empty, the row ends with fewer fields

### Common Conversion Examples

Check EVERY analyte column, not just Creatinine/Glucose/Hemoglobin:

- Creatinine 97.0 → outside [0.2, 20.0] → 97.0 × 0.0113 = 1.10
- Creatinine 133.0 → outside [0.2, 20.0] → 133.0 × 0.0113 = 1.50
- Creatinine 88.4 → outside [0.2, 20.0] → 88.4 × 0.0113 = 1.00
- Glucose 6.1 → outside [30, 500] → 6.1 ÷ 0.0555 = 109.91
- Glucose 9.5 → outside [30, 500] → 9.5 ÷ 0.0555 = 171.17
- Glucose 5.3 → outside [30, 500] → 5.3 ÷ 0.0555 = 95.50
- Hemoglobin 135 → outside [3, 20] → 135 × 0.1 = 13.50
- Hemoglobin 142 → outside [3, 20] → 142 × 0.1 = 14.20
- Cholesterol 5.18 → outside [50, 400] → 5.18 ÷ 0.0259 = 200.00
- Cholesterol 6.47 → outside [50, 400] → 6.47 ÷ 0.0259 = 249.81
- Cholesterol 4.40 → outside [50, 400] → 4.40 ÷ 0.0259 = 169.88
- Calcium 2.25 → outside [4, 15] → 2.25 ÷ 0.2495 = 9.02
- Calcium 2.50 → outside [4, 15] → 2.50 ÷ 0.2495 = 10.02
- Calcium 2.24 → outside [4, 15] → 2.24 ÷ 0.2495 = 8.98
- BUN 5.0 → inside [2, 150] → keep 5.00 (no conversion)
- Creatinine 1.20 → inside [0.2, 20.0] → keep 1.20 (no conversion)
