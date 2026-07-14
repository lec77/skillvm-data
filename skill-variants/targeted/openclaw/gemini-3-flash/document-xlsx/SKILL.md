---
name: xlsx
description: "Spreadsheet creation, editing, and analysis with Excel formulas, formatting, and data visualization. Use when working with .xlsx/.xlsm files."
---

# Excel Spreadsheet Skill

## Critical Rules

1. **ALWAYS save to the EXACT filename the user requested.**
2. **ALWAYS write Python code to a .py file, then run it.** NEVER use `python3 -c "..."` — write a `.py` file and run `python3 script.py`.
3. **Use openpyxl** for ALL spreadsheet operations (reading AND writing). Do NOT use pandas. openpyxl is already installed.
4. **Use Excel formulas** (`=SUM(...)`, `=AVERAGE(...)`) instead of computing values in Python when creating spreadsheets.
5. **Apply red fill directly to cells** using `PatternFill` — do not use openpyxl's `ConditionalFormatting` rules.

## Workflow

1. Write a Python script to a `.py` file (e.g., `task.py`)
2. Run it with `python3 task.py`
3. Verify the output file exists with `ls -la <filename>`

## Reading & Analyzing Spreadsheets

When reading an existing .xlsx file to extract data:

```python
# analyze.py
from openpyxl import load_workbook
import json

wb = load_workbook("input.xlsx", data_only=True)
ws = wb["SheetName"]

# Read header row
headers = [cell.value for cell in ws[1]]

# Read ONLY data rows — skip header (row 1) and any summary/total rows at the bottom
data_rows = []
for row in ws.iter_rows(min_row=2, max_row=ws.max_row):
    first_cell = row[0].value
    # Skip rows where first cell is None, empty, or a label like "TOTAL"
    if first_cell is None or (isinstance(first_cell, str) and first_cell.upper() in ("TOTAL", "SUM", "AVERAGE", "")):
        continue
    data_rows.append([cell.value for cell in row])

# Process data_rows...
# IMPORTANT: When counting rows for rates/percentages, only count actual data rows
```

**Key rule**: Spreadsheets often have summary rows (TOTAL, SUM, AVERAGE) at the bottom. ALWAYS filter these out before aggregating data. Count only actual data rows for percentages and rates.

## Creating Spreadsheets

### Template

```python
# create_report.py
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font

wb = Workbook()
ws = wb.active
ws.title = "Report"

# Headers in row 1
headers = ["Product", "Q1", "Q2", "Q3", "Q4"]
for col, h in enumerate(headers, 1):
    ws.cell(row=1, column=col, value=h).font = Font(bold=True)

# Data rows starting at row 2
data = [
    ["Alpha", 50000, 35000, 60000, 45000],
    ["Beta",  30000, 42000, 38000, 55000],
]
for r, row_data in enumerate(data, 2):
    for c, val in enumerate(row_data, 1):
        ws.cell(row=r, column=c, value=val)

data_end_row = 1 + len(data)
sum_row = data_end_row + 1
avg_row = sum_row + 1

# SUM formulas
ws.cell(row=sum_row, column=1, value="Total").font = Font(bold=True)
for col in range(2, len(headers) + 1):
    letter = ws.cell(row=1, column=col).column_letter
    ws.cell(row=sum_row, column=col, value=f"=SUM({letter}2:{letter}{data_end_row})")

# AVERAGE formulas
ws.cell(row=avg_row, column=1, value="Average").font = Font(bold=True)
for col in range(2, len(headers) + 1):
    letter = ws.cell(row=1, column=col).column_letter
    ws.cell(row=avg_row, column=col, value=f"=AVERAGE({letter}2:{letter}{data_end_row})")

# Red fill for cells below threshold
red = PatternFill(start_color="FFFF0000", end_color="FFFF0000", fill_type="solid")
for r in range(2, data_end_row + 1):
    for c in range(2, len(headers) + 1):
        cell = ws.cell(row=r, column=c)
        if isinstance(cell.value, (int, float)) and cell.value < 40000:
            cell.fill = red

# Currency format
for r in range(2, avg_row + 1):
    for c in range(2, len(headers) + 1):
        ws.cell(row=r, column=c).number_format = "$#,##0"

# Column widths
for col in range(1, len(headers) + 1):
    ws.column_dimensions[ws.cell(row=1, column=col).column_letter].width = 15

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

## Common Mistakes to Avoid

- **Using pandas**: Do NOT use pandas to read xlsx. Use `openpyxl.load_workbook()`.
- **Using python3 -c**: NEVER. Always write a .py file.
- **Including summary rows in analysis**: When computing totals, averages, or rates from a spreadsheet, skip any TOTAL/SUM/AVERAGE rows. Only process actual data rows.
- **Wrong filename**: ALWAYS use the exact filename the user asked for.
- **Off-by-one in formula ranges**: Header is row 1, data starts row 2.
