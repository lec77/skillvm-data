# Excel Spreadsheet Instructions

You MUST follow these rules when working with .xlsx files. Do NOT call any "skill" tool. Just follow the instructions below directly.

## Rules

1. Save to the EXACT filename the user requested.
2. Write Python code to a .py file, then run it with `python3 <file>.py`. NEVER use `python3 -c` for multi-line code.
3. Use `openpyxl` (already installed) for creating and reading xlsx files.
4. Use Excel formulas (`=SUM(...)`, `=AVERAGE(...)`) instead of computing values in Python.
5. Apply red fill directly to cells using `PatternFill` — do NOT use `ConditionalFormatting`.

## Creating a Spreadsheet

Write a Python script like this and run it:

```python
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

last_data_row = 1 + len(data)  # header is row 1

# SUM row
sum_row = last_data_row + 1
ws.cell(row=sum_row, column=1, value="Total").font = Font(bold=True)
for col in range(2, len(headers) + 1):
    letter = ws.cell(row=1, column=col).column_letter
    ws.cell(row=sum_row, column=col, value=f"=SUM({letter}2:{letter}{last_data_row})")

# AVERAGE row
avg_row = sum_row + 1
ws.cell(row=avg_row, column=1, value="Average").font = Font(bold=True)
for col in range(2, len(headers) + 1):
    letter = ws.cell(row=1, column=col).column_letter
    ws.cell(row=avg_row, column=col, value=f"=AVERAGE({letter}2:{letter}{last_data_row})")

# Red fill for cells below threshold
red = PatternFill(start_color="FFFF0000", end_color="FFFF0000", fill_type="solid")
for r in range(2, last_data_row + 1):
    for c in range(2, len(headers) + 1):
        cell = ws.cell(row=r, column=c)
        if isinstance(cell.value, (int, float)) and cell.value < 50000:
            cell.fill = red

# Currency format
for r in range(2, avg_row + 1):
    for c in range(2, len(headers) + 1):
        ws.cell(row=r, column=c).number_format = "$#,##0"

# Column widths
for c in range(1, len(headers) + 1):
    ws.column_dimensions[ws.cell(row=1, column=c).column_letter].width = 15

wb.save("output.xlsx")
print("Done")
```

## Reading/Analyzing a Spreadsheet

Write a .py file. WARNING: Excel files often have TOTAL/SUM rows at the bottom. You MUST filter these out before counting rows or computing rates.

```python
from openpyxl import load_workbook
import json

wb = load_workbook("input.xlsx", data_only=True)
ws = wb["SheetName"]

# IMPORTANT: Filter out summary rows (TOTAL, SUM, AVERAGE, empty)
SKIP_LABELS = {"TOTAL", "SUM", "AVERAGE", "GRAND TOTAL", ""}
data = []
for row in ws.iter_rows(min_row=2, values_only=True):
    first_cell = row[0]
    if first_cell is None:
        continue
    if isinstance(first_cell, str) and first_cell.strip().upper() in SKIP_LABELS:
        continue
    data.append(row)

# Now use ONLY the filtered `data` list for ALL calculations
# len(data) = number of actual data rows (excludes TOTAL rows)
# Use len(data) as denominator for any rate/percentage calculations
total_rows = len(data)

result = {}
with open("output.json", "w") as f:
    json.dump(result, f, indent=2)
print("Done")
```

CRITICAL: When computing percentages like approval_rate, divide by `len(data)` (filtered rows), NOT by the total number of rows in the sheet.
