---
name: xlsx
description: "Spreadsheet creation, editing, and analysis with Excel formulas, formatting, and data visualization. Use when working with .xlsx files."
---

# Excel Spreadsheet Skill

## Critical Rules

1. **Save to the EXACT filename requested.** If user says "sales_report.xlsx", save to `sales_report.xlsx`.
2. **Write Python to a .py file, then run it.** NEVER use `python3 -c "..."` for multi-line code.
3. **Use openpyxl** (pre-installed) for all spreadsheet operations.
4. **Use Excel formulas** (`=SUM(...)`, `=AVERAGE(...)`) instead of computing in Python.
5. **Apply red fill directly** with `PatternFill` — do NOT use `ConditionalFormatting` rules.

## Workflow

1. Write Python script to a `.py` file
2. Run with `python3 <script>.py`
3. Verify output with `ls -la <filename>`

## Creating Spreadsheets

```python
# create_report.py
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font

wb = Workbook()
ws = wb.active
ws.title = "Sales Report"

# Row 1: Headers
headers = ["Product", "Q1", "Q2", "Q3", "Q4"]
for col, h in enumerate(headers, 1):
    ws.cell(row=1, column=col, value=h).font = Font(bold=True)

# Rows 2+: Data
data = [
    ["Alpha", 50000, 35000, 60000, 45000],
    ["Beta",  30000, 42000, 38000, 55000],
    ["Gamma", 70000, 28000, 65000, 72000],
]
for r, row_data in enumerate(data, 2):
    for c, val in enumerate(row_data, 1):
        cell = ws.cell(row=r, column=c, value=val)
        if c >= 2:
            cell.number_format = '$#,##0'

last_data_row = len(data) + 1  # 3 products -> last row is 4

# SUM formulas row
sum_row = last_data_row + 1
ws.cell(row=sum_row, column=1, value="Total").font = Font(bold=True)
for col in range(2, len(headers) + 1):
    letter = ws.cell(row=1, column=col).column_letter
    ws.cell(row=sum_row, column=col, value=f"=SUM({letter}2:{letter}{last_data_row})")

# AVERAGE formulas row
avg_row = sum_row + 1
ws.cell(row=avg_row, column=1, value="Average").font = Font(bold=True)
for col in range(2, len(headers) + 1):
    letter = ws.cell(row=1, column=col).column_letter
    ws.cell(row=avg_row, column=col, value=f"=AVERAGE({letter}2:{letter}{last_data_row})")

# Red fill: apply to DATA cells only (not formula cells)
red = PatternFill(start_color="FFFF0000", end_color="FFFF0000", fill_type="solid")
for r in range(2, last_data_row + 1):
    for c in range(2, len(headers) + 1):
        cell = ws.cell(row=r, column=c)
        if isinstance(cell.value, (int, float)) and cell.value < 40000:
            cell.fill = red

# Column widths
for col in range(1, len(headers) + 1):
    ws.column_dimensions[ws.cell(row=1, column=col).column_letter].width = 15

wb.save("report.xlsx")
```

## Reading/Analyzing Spreadsheets

When reading xlsx files, use `data_only=True` to get computed values instead of formulas.

**IMPORTANT:** Skip summary/formula rows (rows containing "TOTAL", "SUM", "AVERAGE", etc.) — only process actual data rows.

```python
# analyze.py
import openpyxl
import json

wb = openpyxl.load_workbook("data.xlsx", data_only=True)
ws = wb["SheetName"]

results = {}
for row in ws.iter_rows(min_row=2, values_only=True):
    month, category, amount, approved = row
    # Skip summary rows
    if isinstance(month, str) and month.upper() in ("TOTAL", "SUM", "AVERAGE", "GRAND TOTAL"):
        continue
    if amount is None:
        continue
    # Process data...

# For approval_rate: count only data rows, check if approved is True (boolean)
# approval_rate = approved_count / total_data_rows * 100

with open("result.json", "w") as f:
    json.dump(results, f, indent=2)
```

## Key Patterns

| Task | Code |
|------|------|
| Bold header | `cell.font = Font(bold=True)` |
| Currency | `cell.number_format = '$#,##0'` |
| Red fill | `cell.fill = PatternFill(start_color='FFFF0000', end_color='FFFF0000', fill_type='solid')` |
| Column width | `ws.column_dimensions['A'].width = 15` |
| SUM formula | `cell.value = '=SUM(B2:B6)'` |
| AVERAGE formula | `cell.value = '=AVERAGE(B2:B6)'` |
| Column letter | `ws.cell(row=1, column=col_idx).column_letter` |

## Common Mistakes

- **Wrong filename**: ALWAYS use the exact name requested
- **Overwriting data with formulas**: Put formulas in DIFFERENT rows than data
- **Off-by-one in ranges**: Header=row 1, data starts row 2. 5 data rows -> last is row 6
- **Counting summary rows**: When analyzing, skip rows with "TOTAL" or formula values
- **Comparing formula cells**: Formula cells contain strings like `"=SUM(...)"` — check numeric values instead
