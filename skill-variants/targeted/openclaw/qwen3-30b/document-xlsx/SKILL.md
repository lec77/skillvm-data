---
name: xlsx
description: "Spreadsheet creation, editing, and analysis with Excel formulas, formatting, and data visualization. Use when Claude needs to work with .xlsx/.xlsm files: creating spreadsheets with formulas, reading/analyzing Excel data, modifying existing workbooks, or building reports with formatting and formulas."
---

# Excel Spreadsheet Skill

## Critical Rules

1. **NEVER use the `read` tool on .xlsx files.** Excel files are binary — the read tool returns garbage. ALWAYS use Python with openpyxl to read xlsx files.
2. **ALWAYS write Python code to a .py file, then run it with bash.** NEVER use `python3 -c "..."` for multi-line code.
3. **ALWAYS save output to the EXACT filename the user requested.**
4. **Use openpyxl** for all spreadsheet operations. It is already installed.
5. **Use Excel formulas** (`=SUM(...)`, `=AVERAGE(...)`) instead of computing values in Python when creating spreadsheets.
6. **Apply red fill directly to cells** using `PatternFill` — do not use openpyxl's `ConditionalFormatting` rules.

## Workflow

### Creating a spreadsheet:
1. Write a Python script to a `.py` file
2. Run it with bash: `python3 script.py`
3. Verify output exists: `ls -la <filename>`

### Reading/analyzing a spreadsheet:
1. Write a Python script that uses `openpyxl.load_workbook()` to open the file
2. **Skip non-data rows** — spreadsheets often have summary/total rows at the bottom. Check that key columns are not None/empty before processing a row. For example: `if category is None or category == "TOTAL": continue`
3. Extract data from cells, compute aggregations in Python
4. Write results to the requested output format (JSON, etc.)
5. Run with bash: `python3 script.py`

## Example: Reading and Analyzing an xlsx file

**Task:** "Read data.xlsx and produce summary.json with totals by category."

```python
# analyze.py
import json
from openpyxl import load_workbook

wb = load_workbook("data.xlsx")
ws = wb["Sheet1"]

totals = {}
approved_count = 0
total_count = 0
for row in ws.iter_rows(min_row=2, values_only=True):
    category, amount, approved = row[0], row[1], row[2]
    # Skip summary/total rows — they have None or non-data values
    if category is None or str(category).upper() == "TOTAL":
        continue
    if not isinstance(amount, (int, float)):
        continue
    totals[category] = totals.get(category, 0) + amount
    total_count += 1
    if approved is True:
        approved_count += 1

result = {
    "total_by_category": totals,
    "grand_total": sum(totals.values()),
    "approval_rate": round((approved_count / total_count) * 100) if total_count > 0 else 0
}
with open("summary.json", "w") as f:
    json.dump(result, f, indent=2)
print("Done")
```

Run: `python3 analyze.py`

## Example: Creating a spreadsheet

**Task:** "Create report.xlsx with Q1-Q4 data, totals, averages, red fill below 40000."

```python
# create_report.py
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font

wb = Workbook()
ws = wb.active
ws.title = "Sales Report"

headers = ["Product", "Q1", "Q2", "Q3", "Q4"]
for col, h in enumerate(headers, 1):
    ws.cell(row=1, column=col, value=h).font = Font(bold=True)

data = [
    ["Alpha", 50000, 35000, 60000, 45000],
    ["Beta",  30000, 42000, 38000, 55000],
    ["Gamma", 70000, 28000, 65000, 72000],
]
for r, row_data in enumerate(data, 2):
    for c, val in enumerate(row_data, 1):
        ws.cell(row=r, column=c, value=val)

# SUM row
sum_row = len(data) + 2
ws.cell(row=sum_row, column=1, value="Total").font = Font(bold=True)
for col in range(2, len(headers) + 1):
    letter = ws.cell(row=1, column=col).column_letter
    ws.cell(row=sum_row, column=col, value=f"=SUM({letter}2:{letter}{sum_row-1})")

# AVERAGE row
avg_row = sum_row + 1
ws.cell(row=avg_row, column=1, value="Average").font = Font(bold=True)
for col in range(2, len(headers) + 1):
    letter = ws.cell(row=1, column=col).column_letter
    ws.cell(row=avg_row, column=col, value=f"=AVERAGE({letter}2:{letter}{sum_row-1})")

# Red fill for cells below 40000
red = PatternFill(start_color="FFFF0000", end_color="FFFF0000", fill_type="solid")
for r in range(2, sum_row):
    for c in range(2, len(headers) + 1):
        cell = ws.cell(row=r, column=c)
        if isinstance(cell.value, (int, float)) and cell.value < 40000:
            cell.fill = red

# Currency format for dollar values
for r in range(2, avg_row + 1):
    for c in range(2, len(headers) + 1):
        ws.cell(row=r, column=c).number_format = "$#,##0"

# Auto-size columns
for c in range(1, len(headers) + 1):
    ws.column_dimensions[ws.cell(row=1, column=c).column_letter].width = 15

wb.save("report.xlsx")
print("Done")
```

## Key Patterns

| Task | Code |
|------|------|
| Load existing xlsx | `wb = load_workbook("file.xlsx")` |
| Get sheet by name | `ws = wb["SheetName"]` |
| Iterate rows | `for row in ws.iter_rows(min_row=2, values_only=True):` |
| Bold header | `cell.font = Font(bold=True)` |
| Currency format | `cell.number_format = '$#,##0'` |
| Red fill | `cell.fill = PatternFill(start_color='FFFF0000', end_color='FFFF0000', fill_type='solid')` |
| SUM formula | `cell.value = '=SUM(B2:B6)'` |
| AVERAGE formula | `cell.value = '=AVERAGE(B2:B6)'` |
| Write JSON | `json.dump(result, open("out.json", "w"), indent=2)` |

## Common Mistakes to Avoid

- **Using `read` tool on xlsx**: NEVER do this. xlsx is binary. Use Python openpyxl instead.
- **Wrong filename**: ALWAYS use the exact name the user asked for
- **Inline python**: NEVER run multi-line Python with `python3 -c` — write a .py file
- **Off-by-one in formula ranges**: Header is row 1, data starts row 2
