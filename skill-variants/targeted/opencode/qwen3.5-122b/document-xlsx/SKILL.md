---
name: xlsx
description: "Spreadsheet creation, editing, and analysis with Excel formulas, formatting, and data visualization. Use when Claude needs to work with .xlsx/.xlsm files: creating spreadsheets with formulas, reading/analyzing Excel data, modifying existing workbooks, or building reports with formatting and formulas."
---

# Excel Spreadsheet Skill

## Critical Rules

1. **ALWAYS save to the EXACT filename the user requested.** If they say "create sales_report.xlsx", save to `sales_report.xlsx` — never add suffixes.
2. **ALWAYS write Python code to a .py file, then run it.** NEVER use `python3 -c "..."` for multi-line code.
3. **Use openpyxl** for all spreadsheet work. It is already installed.
4. **Use Excel formulas** (`=SUM(...)`, `=AVERAGE(...)`) instead of computing values in Python. Keep spreadsheets dynamic.
5. **Apply red fill directly to cells** using `PatternFill` — do NOT use `ConditionalFormatting`. Check each data cell's numeric value and set `cell.fill` if it meets the condition.
6. **ALWAYS apply currency formatting** (`$#,##0`) to all dollar/money cells. This is required for professional output.

## Workflow

1. Write a Python script to a `.py` file
2. Run it with `python3 <script>.py`
3. Verify with `ls -la <filename>`
4. Done. Do NOT run `recalc.py` or download external scripts.

## Bundled Template Script

A ready-to-use template is at `scripts/create_xlsx.py`. To use it:
1. Read the template
2. Modify CONFIG and DATA sections
3. Save your version and run it

## Complete Working Example

**Task:** "Create report.xlsx with Q1-Q4 data for 3 products, totals and averages, highlight values under 40000 in red."

```python
# create_report.py
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font

wb = Workbook()
ws = wb.active
ws.title = "Sales Report"

# Headers in row 1 — bold
headers = ["Product", "Q1", "Q2", "Q3", "Q4"]
for col, h in enumerate(headers, 1):
    ws.cell(row=1, column=col, value=h).font = Font(bold=True)

# Data rows starting at row 2
data = [
    ["Alpha", 50000, 35000, 60000, 45000],
    ["Beta",  30000, 42000, 38000, 55000],
    ["Gamma", 70000, 28000, 65000, 72000],
]
for r, row_data in enumerate(data, 2):
    for c, val in enumerate(row_data, 1):
        ws.cell(row=r, column=c, value=val)

# SUM row (row 5)
ws.cell(row=5, column=1, value="Total").font = Font(bold=True)
for col in range(2, 6):
    letter = ws.cell(row=1, column=col).column_letter
    ws.cell(row=5, column=col, value=f"=SUM({letter}2:{letter}4)")

# AVERAGE row (row 6)
ws.cell(row=6, column=1, value="Average").font = Font(bold=True)
for col in range(2, 6):
    letter = ws.cell(row=1, column=col).column_letter
    ws.cell(row=6, column=col, value=f"=AVERAGE({letter}2:{letter}4)")

# Red fill for cells below threshold — apply BEFORE currency format
red = PatternFill(start_color="FFFF0000", end_color="FFFF0000", fill_type="solid")
for r in range(2, 5):
    for c in range(2, 6):
        cell = ws.cell(row=r, column=c)
        if isinstance(cell.value, (int, float)) and cell.value < 40000:
            cell.fill = red

# Currency format on ALL dollar cells (data + formulas)
for r in range(2, 7):
    for c in range(2, 6):
        ws.cell(row=r, column=c).number_format = "$#,##0"

# Column widths for readability
for c in range(1, 6):
    ws.column_dimensions[ws.cell(row=1, column=c).column_letter].width = 15

wb.save("report.xlsx")
print("Done")
```

## Key Patterns

| Task | Code |
|------|------|
| Bold header | `cell.font = Font(bold=True)` |
| Currency format | `cell.number_format = '$#,##0'` |
| Red fill | `cell.fill = PatternFill(start_color='FFFF0000', end_color='FFFF0000', fill_type='solid')` |
| Column width | `ws.column_dimensions['A'].width = 15` |
| SUM formula | `cell.value = '=SUM(B2:B6)'` |
| AVERAGE formula | `cell.value = '=AVERAGE(B2:B6)'` |
| Column letter | `ws.cell(row=1, column=col_idx).column_letter` |

## Reading & Analyzing Spreadsheets

When reading an existing `.xlsx` file to extract data:

```python
from openpyxl import load_workbook
wb = load_workbook("data.xlsx", data_only=True)  # data_only=True reads cached values instead of formulas
ws = wb["SheetName"]
```

**Critical: Skip non-data rows.** Spreadsheets often have summary/formula rows (e.g., "TOTAL" row at the bottom). When iterating rows, **skip rows where column A contains labels like "TOTAL", "SUM", "AVERAGE"** — only process actual data rows. Also skip formula cells (type `str` starting with `=`).

**Count ALL data rows** including those with zero values. A row with Amount=0 is still a valid data row — do not filter it out unless explicitly asked.

**For boolean columns** (like "Approved"): count `True` values among ALL data rows, not just rows meeting some other condition. The denominator is always the total number of data rows.

**Output JSON:** When producing analysis results as JSON, use `json.dumps(result, indent=2)` and write to the exact filename requested. Ensure numeric values are numbers (not strings) in the JSON output.

## Common Mistakes

- **Wrong filename**: ALWAYS use the exact name requested
- **Inline python**: NEVER run multi-line Python with `python3 -c`
- **No currency format**: ALWAYS apply `$#,##0` to money cells
- **Overwriting data with formulas**: Data and formula cells go in DIFFERENT rows
- **Off-by-one in ranges**: Header=row 1, data starts row 2. If 5 data rows → last data row is 6
- **Comparing formula cells**: Formula cells are strings. Check numeric values for conditional formatting
- **Filtering zero-value rows**: Do NOT exclude rows where Amount=0 — they are valid data
