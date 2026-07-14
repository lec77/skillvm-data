---
name: xlsx
description: "REQUIRED for any task involving .xlsx or Excel files. Load this skill FIRST before doing anything with spreadsheets — creating, reading, analyzing, or modifying .xlsx files."
---

# Excel Spreadsheet Skill

## Critical Rules

1. **ALWAYS save to the EXACT filename the user requested.**
2. **ALWAYS write Python code to a .py file, then run it.** NEVER use `python3 -c "..."` for multi-line code.
3. **Use openpyxl** for all spreadsheet operations. It is already installed.
4. **Use Excel formulas** (`=SUM(...)`, `=AVERAGE(...)`) instead of computing values in Python when creating spreadsheets.
5. **Apply red fill directly to cells** using `PatternFill` — do NOT use openpyxl's `ConditionalFormatting` rules. Check each data cell's numeric value and set `cell.fill` if it meets the condition.

## Workflow

1. Write a Python script to a `.py` file
2. Run it with `python3 <script>.py`
3. Verify output with `ls -la <filename>`

## Creating Spreadsheets

Use the bundled template at `scripts/create_xlsx.py`. Copy it, edit CONFIG and DATA sections, then run.

**Key patterns:**
- Bold header: `cell.font = Font(bold=True)`
- Currency: `cell.number_format = '$#,##0'`
- Red fill: `cell.fill = PatternFill(start_color='FFFF0000', end_color='FFFF0000', fill_type='solid')`
- Column width: `ws.column_dimensions['A'].width = 15`
- SUM: `cell.value = '=SUM(B2:B6)'`
- AVERAGE: `cell.value = '=AVERAGE(B2:B6)'`
- Column letter: `ws.cell(row=1, column=col_idx).column_letter`

## Reading/Analyzing Spreadsheets

When reading xlsx files, ALWAYS use openpyxl in Python — never try to read xlsx directly as text.

**Critical: Skip formula/summary rows.** Spreadsheets often have TOTAL or SUM rows at the bottom. These contain formula strings (like `=SUM(...)`) not numbers. When analyzing data:
- Check if a cell value is a formula string (starts with `=`) and skip it
- Check if a cell value is None and skip it
- Only count rows where the data columns have actual values
- Use `isinstance(value, (int, float))` to verify numeric data before arithmetic

**Template for reading xlsx:**

```python
from openpyxl import load_workbook
import json

wb = load_workbook('input.xlsx', data_only=True)
ws = wb['SheetName']

results = {}
for row in ws.iter_rows(min_row=2, values_only=True):
    # Skip rows where key columns are None or formulas
    if row[0] is None or (isinstance(row[0], str) and row[0].startswith('=')):
        continue
    # Skip summary/total rows
    if isinstance(row[0], str) and row[0].upper() in ('TOTAL', 'SUM', 'AVERAGE'):
        continue
    # Process data row...

with open('output.json', 'w') as f:
    json.dump(results, f, indent=2)
```

## Common Mistakes to Avoid

- **Wrong filename**: ALWAYS use the exact name the user asked for
- **Inline python**: NEVER run multi-line Python with `python3 -c`
- **Reading xlsx as text**: ALWAYS use openpyxl to read xlsx files
- **Counting formula rows as data**: Skip TOTAL/SUM rows when analyzing
- **Off-by-one in formula ranges**: Header is row 1, data starts row 2
