---
name: xlsx
description: "Spreadsheet creation, editing, and analysis with Excel formulas, formatting, and data visualization. Use when Claude needs to work with .xlsx/.xlsm files: creating spreadsheets with formulas, reading/analyzing Excel data, modifying existing workbooks, or building reports with formatting and formulas."
---

# Excel Spreadsheet Skill

## Critical Rules

1. **ALWAYS save to the EXACT filename the user requested.** If they say "create sales_report.xlsx", save to `sales_report.xlsx` — never `sales_report_final.xlsx` or `sales_report_v2.xlsx`.
2. **ALWAYS write Python code to a .py file, then run it.** NEVER use `python3 -c "..."` for multi-line code.
3. **Use openpyxl** for all spreadsheet work. It is already installed.
4. **Use Excel formulas** (`=SUM(...)`, `=AVERAGE(...)`) instead of computing values in Python. Spreadsheets must stay dynamic.
5. **Apply red fill directly to cells** using `PatternFill` — do NOT use openpyxl's `ConditionalFormatting` rules. Check each data cell's numeric value and set `cell.fill` if it meets the condition.
6. **ALWAYS apply professional formatting:** bold headers with `Font(bold=True)`, currency format `'$#,##0'` on all numeric cells, and column widths of 15.

## Workflow

1. Write a Python script to a `.py` file
2. Run it with `python3 <script>.py`
3. Verify the output file exists with `ls -la <filename>`

## Reading/Analyzing XLSX Files

To read and analyze an existing xlsx file, use openpyxl:

```python
from openpyxl import load_workbook
import json

wb = load_workbook("input.xlsx", data_only=True)
ws = wb.active  # or wb["SheetName"]

# Read all rows
for row in ws.iter_rows(min_row=2, values_only=True):
    month, category, amount, approved = row
    # process data...

# Write results to JSON
with open("output.json", "w") as f:
    json.dump(results, f, indent=2)
```

## Creating XLSX Files — Complete Example

**Task:** "Create report.xlsx with Q1-Q4 data for 3 products, add totals and averages, highlight values under 40000 in red."

```python
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font

wb = Workbook()
ws = wb.active
ws.title = "Sales Report"

# Headers row 1 — MUST be bold
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

last_data_row = 1 + len(data)  # 4

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

# Red fill for data cells below threshold (check numeric value, NOT formula cells)
red = PatternFill(start_color="FFFF0000", end_color="FFFF0000", fill_type="solid")
for r in range(2, last_data_row + 1):
    for c in range(2, len(headers) + 1):
        cell = ws.cell(row=r, column=c)
        if isinstance(cell.value, (int, float)) and cell.value < 40000:
            cell.fill = red

# Currency format on ALL numeric cells (data + formula rows)
for r in range(2, avg_row + 1):
    for c in range(2, len(headers) + 1):
        ws.cell(row=r, column=c).number_format = "$#,##0"

# Column widths
for c in range(1, len(headers) + 1):
    ws.column_dimensions[ws.cell(row=1, column=c).column_letter].width = 15

wb.save("report.xlsx")
print("Done")
```

## Common Mistakes to Avoid

- **Wrong filename**: ALWAYS use the exact name the user asked for
- **Inline python**: NEVER run multi-line Python with `python3 -c` — write a .py file
- **Missing formatting**: ALWAYS add `Font(bold=True)` on headers, `number_format = '$#,##0'` on numeric cells, and `column_dimensions[...].width = 15`
- **Off-by-one in formula ranges**: Header is row 1, data starts row 2. If 5 data rows, last data row is 6
- **Red fill on formula cells**: Only apply red fill to data cells with numeric values, not formula cells
