---
name: xlsx
description: "Create and analyze Excel .xlsx files using Python openpyxl. Use for any task involving spreadsheets."
---

# Excel Spreadsheet Skill

## Rules

1. Save to the EXACT filename the user requested
2. Write Python to a .py file, then run it. NEVER use `python3 -c "..."` for multi-line code
3. Use `openpyxl` (already installed) for creating/reading .xlsx files
4. Use Excel formulas (=SUM, =AVERAGE) not Python math for spreadsheet calculations
5. Apply red fill with PatternFill directly on cells, not ConditionalFormatting rules
6. Do NOT look for template scripts or external files. Write your own script from scratch.

## Creating a Spreadsheet

Write a Python script like this, then run it:

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
        if isinstance(cell.value, (int, float)) and cell.value < 50000:
            cell.fill = red

wb.save("EXACT_FILENAME.xlsx")
print("Done")
```

## Analyzing a Spreadsheet

ALWAYS write analysis code to a .py file first, then run it.

```python
# analyze.py
from openpyxl import load_workbook
from collections import defaultdict
import json

wb = load_workbook("input.xlsx")  # do NOT use data_only=True
ws = wb["SheetName"]

# Read header row to find column indices
headers = [cell.value for cell in ws[1]]

# Read data rows - skip header, skip summary/formula/empty rows
data = []
for row in ws.iter_rows(min_row=2, values_only=True):
    # Stop at empty rows
    if row[0] is None:
        break
    # Skip summary rows like "TOTAL", "Total", "Sum", "Average"
    if isinstance(row[0], str) and row[0].strip().upper() in ("TOTAL", "SUM", "AVERAGE", "GRAND TOTAL"):
        continue
    # Skip rows that have formulas (strings starting with =) in numeric columns
    if any(isinstance(v, str) and v.startswith("=") for v in row[1:]):
        continue
    item = {}
    for i, h in enumerate(headers):
        item[h] = row[i]
    data.append(item)

print(f"Read {len(data)} data rows")

# IMPORTANT: "highest category" = category with highest TOTAL SPEND, not most frequent
# IMPORTANT: amount=0 is valid data, never skip rows with zero amounts
# IMPORTANT: approval_rate should be a number like 75 for 75%, not 0.75

totals_by_cat = defaultdict(float)
totals_by_month = defaultdict(float)
approved_count = 0
for item in data:
    amt = item["Amount"]
    if isinstance(amt, (int, float)):
        totals_by_cat[item["Category"]] += amt
        totals_by_month[item["Month"]] += amt
    if item["Approved"] == True:  # explicit True check
        approved_count += 1

result = {
    "total_by_category": dict(totals_by_cat),
    "total_by_month": dict(totals_by_month),
    "grand_total": sum(totals_by_cat.values()),
    "highest_category": max(totals_by_cat, key=totals_by_cat.get),
    "approval_rate": round((approved_count / len(data)) * 100, 1),
}
with open("output.json", "w") as f:
    json.dump(result, f, indent=2)
print("Done")
```

## Quick Reference

| Task | Code |
|------|------|
| Bold header | `cell.font = Font(bold=True)` |
| Currency format | `cell.number_format = '$#,##0'` |
| Red fill | `cell.fill = PatternFill(start_color='FFFF0000', end_color='FFFF0000', fill_type='solid')` |
| Column letter | `ws.cell(row=1, column=col).column_letter` |
| SUM formula | `cell.value = '=SUM(B2:B6)'` |
| AVERAGE formula | `cell.value = '=AVERAGE(B2:B6)'` |
