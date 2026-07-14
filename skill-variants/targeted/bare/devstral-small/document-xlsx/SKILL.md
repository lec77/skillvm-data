---
name: xlsx
description: "Guide for working with .xlsx Excel files using Python and openpyxl. To create or read xlsx files, write a Python script (.py file) using openpyxl, then run it with execute_command. Load this skill for code examples."
---

# Excel Spreadsheet Skill

## How to Work With Excel Files

**ALWAYS write a Python script to a .py file, then run it with `python3 filename.py`.** The `openpyxl` library is already installed.

NEVER use `python3 -c "..."` for multi-line code. ALWAYS save to a .py file first.

## Creating an xlsx File

```python
# create_report.py
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font

wb = Workbook()
ws = wb.active
ws.title = "Report"

# Headers row 1
headers = ["Product", "Q1", "Q2", "Q3", "Q4"]
for col, h in enumerate(headers, 1):
    ws.cell(row=1, column=col, value=h).font = Font(bold=True)

# Data rows starting row 2
data = [
    ["Alpha", 50000, 35000, 60000, 45000],
    ["Beta",  30000, 42000, 38000, 55000],
]
for r, row_data in enumerate(data, 2):
    for c, val in enumerate(row_data, 1):
        ws.cell(row=r, column=c, value=val)

last_data_row = 1 + len(data)

# SUM formulas
sum_row = last_data_row + 1
ws.cell(row=sum_row, column=1, value="Total").font = Font(bold=True)
for col in range(2, len(headers) + 1):
    letter = ws.cell(row=1, column=col).column_letter
    ws.cell(row=sum_row, column=col, value=f"=SUM({letter}2:{letter}{last_data_row})")

# AVERAGE formulas
avg_row = sum_row + 1
ws.cell(row=avg_row, column=1, value="Average").font = Font(bold=True)
for col in range(2, len(headers) + 1):
    letter = ws.cell(row=1, column=col).column_letter
    ws.cell(row=avg_row, column=col, value=f"=AVERAGE({letter}2:{letter}{last_data_row})")

# Red fill for values below threshold
red = PatternFill(start_color="FFFF0000", end_color="FFFF0000", fill_type="solid")
for r in range(2, last_data_row + 1):
    for c in range(2, len(headers) + 1):
        cell = ws.cell(row=r, column=c)
        if isinstance(cell.value, (int, float)) and cell.value < 40000:
            cell.fill = red

wb.save("report.xlsx")
print("Created report.xlsx")
```

## Reading and Analyzing an xlsx File

```python
# analyze.py
import json
from openpyxl import load_workbook

wb = load_workbook("input.xlsx", data_only=True)
ws = wb["SheetName"]

# Read all rows (skip header)
data = []
for row in ws.iter_rows(min_row=2, values_only=False):
    if row[0].value is None:
        break
    data.append([cell.value for cell in row])

# Example: group by category (column index 1) and sum amounts (column index 2)
totals = {}
for row in data:
    cat = str(row[1])
    amt = row[2] if isinstance(row[2], (int, float)) else 0
    totals[cat] = totals.get(cat, 0) + amt

result = {"totals": totals, "grand_total": sum(totals.values())}

with open("output.json", "w") as f:
    json.dump(result, f, indent=2)
print("Created output.json")
```

## Critical Rules

1. Save to the EXACT filename requested
2. Write Python to a .py file, then run with `python3`
3. Use `openpyxl` (already installed)
4. **ALL formulas MUST start with `=`**: `"=SUM(...)"`, `"=AVERAGE(...)"` — never omit the `=`
5. **Write data cells and formula cells to DIFFERENT rows.** Do NOT compute values in Python then overwrite with formulas — write formulas in dedicated Total/Average rows BELOW the data
6. For red fill, use `PatternFill(start_color="FFFF0000", end_color="FFFF0000", fill_type="solid")` directly on cells — do NOT use ConditionalFormatting
7. Check `isinstance(cell.value, (int, float))` before comparing cell values
8. To read xlsx: use `load_workbook("file.xlsx", data_only=True)`
