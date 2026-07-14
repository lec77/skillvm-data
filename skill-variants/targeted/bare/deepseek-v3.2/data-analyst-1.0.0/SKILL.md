---
name: data-analyst
version: 1.0.0
description: "Data analysis: CSV processing, aggregation, pivoting, cleaning, and report generation."
author: openclaw
---

# Data Analyst Skill

Analyze CSV data, produce structured JSON reports, and clean datasets.

## CSV Analysis & Aggregation

When computing aggregations from CSV:

1. **Read and parse** the CSV carefully — note column names and types
2. **Compute derived values** when needed (e.g., revenue = amount × quantity)
3. **Group and aggregate** by the requested dimensions
4. **Sort** results as specified (chronological for time series, descending for rankings)
5. **Output valid JSON** with exact field names as requested

### Pivot Pattern

```
Read CSV → compute per-row values → group by dimension → aggregate → sort → output JSON
```

Key: match output field names exactly to the request. Use arrays of objects for breakdowns.

## Data Cleaning

### Process

1. **Inspect the raw data** — identify all quality issues BEFORE making changes
2. **Count issues on unique rows only** — if a row appears multiple times (duplicate), count its issues only once when reporting totals for dates_standardized, invalid_emails, etc.
3. **Deduplicate** — remove exact duplicate rows (keep first occurrence)
4. **Standardize dates** — convert all date formats to YYYY-MM-DD
5. **Preserve missing values** — leave empty cells empty, do not fabricate data
6. **Preserve invalid data** — e.g., keep malformed emails as-is
7. **Output cleaned CSV** — same columns as original, with header

### Date Format Recognition

Common non-standard formats to convert to YYYY-MM-DD:
- `MM/DD/YYYY` → `YYYY-MM-DD`
- `MM-DD-YYYY` → `YYYY-MM-DD`
- `YYYY/MM/DD` → `YYYY-MM-DD`
- `Month D YYYY` → `YYYY-MM-DD`

### Cleaning Report

When generating a cleaning report JSON, follow these counting rules EXACTLY:

- **duplicates_removed**: number of duplicate rows deleted (e.g., if Alice appears 2 times, 1 is removed)
- **missing_values**: total empty/blank cells across all rows and columns. Count BEFORE dedup. A missing/empty cell is one where the value is empty string or whitespace. An empty cell is NOT the same as an invalid value.
- **dates_standardized**: FIRST deduplicate the rows conceptually (identify unique rows only), THEN count how many of those unique rows have a date NOT in YYYY-MM-DD format. A date like "2026-01-15" is already standard — don't count it. A date like "01/20/2026" or "March 3 2026" needs standardization — count it. If the same row appears as a duplicate, count that date only ONCE.
- **invalid_emails**: count emails that are PRESENT but malformed (e.g., missing TLD: `user@domain` without a dot in the domain part). Do NOT count empty/missing emails as invalid — those are missing values, not invalid emails. Deduplicate first: if the same person with the same bad email appears twice, count only once.

### CRITICAL: Empty vs Invalid

- An EMPTY email field → counts as a **missing_value**, NOT as an invalid_email
- An email like "charlie@example" (no TLD) → counts as an **invalid_email**, NOT as a missing_value
- These are mutually exclusive categories

### Counting Example

Given data with 15 rows where Alice, Bob, Diana each appear twice:
- 3 duplicate rows removed
- Missing values: count each empty cell in the original 15 rows (e.g., 4 empty cells = 4)
- Dates standardized: among the 12 UNIQUE rows, count those with non-standard dates (e.g., 5 people have non-standard dates = 5)
- Invalid emails: among the 12 UNIQUE rows, count those with malformed but non-empty emails (e.g., 2 emails missing TLD = 2)

## Output Formats

- **JSON**: Use exact field names from the prompt. Ensure valid JSON with proper types (numbers not strings for numeric values).
- **CSV**: Include header row. Match original column order. Use standard comma delimiter.

## Best Practices

1. Read the entire input file before processing
2. Double-check arithmetic — verify totals match sum of parts
3. Use the exact output filenames specified in the prompt
4. For numeric values, output as numbers (not strings) in JSON
