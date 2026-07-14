---
name: xlsx
description: "Spreadsheet creation, editing, and analysis with Excel formulas, formatting, and data visualization. Use when Claude needs to work with .xlsx/.xlsm files: creating spreadsheets with formulas, reading/analyzing Excel data, modifying existing workbooks, or building reports with formatting and formulas."
---

# Excel Spreadsheet Skill

## Critical Rules

1. **ALWAYS save to the EXACT filename the user requested.** If they say "create sales_report.xlsx", save to `sales_report.xlsx` — never `sales_report_final.xlsx` or `sales_report_v2.xlsx`.
2. **ALWAYS write Python code to a .py file, then run it.** NEVER use `python3 -c "..."` for anything longer than a single expression.
3. **Use openpyxl** for all spreadsheet operations. It is already installed.
4. **Use Excel formulas** (`=SUM(...)`, `=AVERAGE(...)`) instead of computing values in Python when creating spreadsheets.
5. **Apply red fill directly to cells** using `PatternFill` — do not use openpyxl's `ConditionalFormatting` rules. Check each data cell's numeric value and set `cell.fill` if it meets the condition.

## Workflow

1. Write a Python script to a `.py` file
2. Run it with `python3 <script>.py`
3. Verify the output file exists
4. Done. Do NOT try to run `recalc.py` or download any external scripts.

---

## Creating Spreadsheets

### Worked Example

**Task:** "Create report.xlsx with Q1-Q4 data for 3 products, add totals and averages, highlight values under 40000 in red."

```python
# create_report.py
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font

wb = Workbook()
ws = wb.active
ws.title = "Sales Report"

# Headers in row 1
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

# Red fill for cells below 40000 — DATA ROWS ONLY
red = PatternFill(start_color="FFFF0000", end_color="FFFF0000", fill_type="solid")
for r in range(2, 5):          # data rows only, not formula rows
    for c in range(2, 6):      # numeric columns only
        cell = ws.cell(row=r, column=c)
        if isinstance(cell.value, (int, float)) and cell.value < 40000:
            cell.fill = red

# Currency formatting
for r in range(2, 7):
    for c in range(2, 6):
        ws.cell(row=r, column=c).number_format = '$#,##0'

wb.save("report.xlsx")
print("Done")
```

### Key Patterns

| Task | Code |
|------|------|
| Bold header | `cell.font = Font(bold=True)` |
| Currency format | `cell.number_format = '$#,##0'` |
| Red fill | `cell.fill = PatternFill(start_color='FFFF0000', end_color='FFFF0000', fill_type='solid')` |
| Column width | `ws.column_dimensions['A'].width = 15` |
| SUM formula | `cell.value = '=SUM(B2:B6)'` |
| AVERAGE formula | `cell.value = '=AVERAGE(B2:B6)'` |

---

## Reading & Analyzing Spreadsheets

When reading an existing xlsx file to extract data, follow these critical rules:

### Critical Rules for Reading

1. **Skip non-data rows.** Spreadsheets often contain header rows (row 1), formula/total rows at the bottom, and empty rows. Only process actual data rows.
2. **Skip rows where key columns are None or empty.** Check that the cell value is not None before processing.
3. **Skip formula cells.** If `str(cell.value).startswith("=")`, that cell contains a formula, not data — skip the entire row.
4. **Use `data_only=False`** (default) to see formulas. Use `data_only=True` if you need calculated values — but note openpyxl cannot evaluate formulas, so `data_only=True` only works for files that were last saved by Excel/LibreOffice.
5. **Boolean values:** In openpyxl, Excel TRUE/FALSE are read as Python `True`/`False`. Count them directly: `if cell.value is True` or `if cell.value == True`.
6. **Approval rate / percentage calculation:** Count ALL data rows, not just approved ones. Rate = (approved_count / total_data_rows) * 100.

### Worked Example: Analyze Spreadsheet

**Task:** "Read expenses.xlsx, compute totals by category and output JSON."

```python
# analyze.py
import json
from openpyxl import load_workbook

wb = load_workbook("expenses.xlsx", data_only=False)
ws = wb["Expenses"]  # Use exact sheet name

# Read header row to find column positions
headers = {}
for col in range(1, ws.max_column + 1):
    val = ws.cell(row=1, column=col).value
    if val:
        headers[str(val).strip()] = col

# Process data rows (skip header row 1, skip formula/total rows)
data_rows = []
for row in range(2, ws.max_row + 1):
    # Skip empty rows or formula rows
    first_cell = ws.cell(row=row, column=1).value
    if first_cell is None:
        continue
    if isinstance(first_cell, str) and first_cell.startswith("="):
        continue

    # Read values from each column
    row_data = {}
    for name, col in headers.items():
        cell = ws.cell(row=row, column=col)
        val = cell.value
        # Skip if this cell is a formula
        if isinstance(val, str) and val.startswith("="):
            continue
        row_data[name] = val

    # Only include rows that have actual category/key data
    if row_data.get("Category") and row_data.get("Amount") is not None:
        data_rows.append(row_data)

# Now compute aggregations from data_rows
total_by_category = {}
total_by_month = {}
grand_total = 0
approved_count = 0

for row in data_rows:
    cat = str(row["Category"])
    amount = float(row["Amount"])

    total_by_category[cat] = total_by_category.get(cat, 0) + amount

    if "Month" in row and row["Month"]:
        month = str(row["Month"])
        total_by_month[month] = total_by_month.get(month, 0) + amount

    grand_total += amount

    # Count approved rows (boolean True)
    if row.get("Approved") is True or row.get("Approved") == True:
        approved_count += 1

highest_category = max(total_by_category, key=total_by_category.get)
approval_rate = round((approved_count / len(data_rows)) * 100)

result = {
    "total_by_category": total_by_category,
    "total_by_month": total_by_month,
    "grand_total": grand_total,
    "highest_category": highest_category,
    "approval_rate": approval_rate
}

with open("expense_analysis.json", "w") as f:
    json.dump(result, f, indent=2)

print("Done:", json.dumps(result, indent=2))
```

### Common Mistakes When Reading

- **Including formula/total rows in counts**: Always check if a cell value starts with "=" and skip those rows
- **Wrong approval rate**: Count ALL data rows as denominator, not just some subset. If 18 of 24 rows are approved, rate = 75, not 72
- **Ignoring None cells**: Always check `if cell.value is not None` before processing
- **Wrong sheet name**: Use the exact sheet name specified, case-sensitive
