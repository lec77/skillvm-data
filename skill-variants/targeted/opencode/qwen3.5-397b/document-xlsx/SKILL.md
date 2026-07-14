---
name: xlsx
description: "Spreadsheet creation, editing, and analysis with Excel formulas, formatting, and data visualization. Use when Claude needs to work with .xlsx/.xlsm files: creating spreadsheets with formulas, reading/analyzing Excel data, modifying existing workbooks, or building reports with formatting and formulas."
---

# Excel Spreadsheet Skill

## Critical Rules

1. **ALWAYS save to the EXACT filename the user requested.** If they say "create sales_report.xlsx", save to `sales_report.xlsx` — never `sales_report_final.xlsx` or `sales_report_v2.xlsx`.
2. **ALWAYS write Python code to a .py file, then run it.** NEVER use `python3 -c "..."` for anything longer than a single expression — for loops and multi-line code cause syntax errors in one-liners.
3. **Use openpyxl** for all spreadsheet creation and formatting. It is already installed.
4. **Use Excel formulas** (`=SUM(...)`, `=AVERAGE(...)`) instead of computing values in Python. Spreadsheets must stay dynamic.
5. **Apply red fill directly to cells** using `PatternFill` — do not use openpyxl's `ConditionalFormatting` rules, which are harder to verify. Check each data cell's numeric value and set `cell.fill` if it meets the condition.
6. **ALWAYS apply professional formatting**: currency format (`cell.number_format = '$#,##0'`) on dollar cells, `ws.column_dimensions[letter].width = 15` for readable columns, and bold headers.

## Workflow

1. Write a Python script to a `.py` file (e.g., `create_report.py`)
2. Run it with `python3 create_report.py`
3. Verify the output file exists with `ls -la <filename>`
4. Done. Do NOT try to run `recalc.py` or download any external scripts.

## Bundled Template Script

A ready-to-use template script is available at `scripts/create_xlsx.py` in this skill's directory. To use it:

1. Read the template: look at `scripts/create_xlsx.py`
2. Copy and modify the CONFIG and DATA sections for your task
3. Save your modified version and run it

The template handles: headers, data rows, SUM formulas, AVERAGE formulas, red fill for cells below threshold, currency formatting, and column widths.

## Worked Example

**Task:** "Create report.xlsx with Q1-Q4 data for 3 products, add totals and averages, highlight values under 40000 in red."

**Step 1: Write script to file**

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

# Red fill for cells below 40000
red = PatternFill(start_color="FFFF0000", end_color="FFFF0000", fill_type="solid")
for r in range(2, 5):          # data rows only
    for c in range(2, 6):      # numeric columns only
        cell = ws.cell(row=r, column=c)
        if isinstance(cell.value, (int, float)) and cell.value < 40000:
            cell.fill = red

# Currency format on all numeric cells (data + formula rows)
for r in range(2, 7):
    for c in range(2, 6):
        ws.cell(row=r, column=c).number_format = '$#,##0'

# Column widths for readability
ws.column_dimensions['A'].width = 15
for c in range(2, 6):
    ws.column_dimensions[ws.cell(row=1, column=c).column_letter].width = 14

wb.save("report.xlsx")  # EXACT filename from the request
print("Done")
```

**Step 2: Run it**
```bash
python3 create_report.py
```

**Step 3: Verify**
```bash
ls -la report.xlsx
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

## Common Mistakes to Avoid

- **Wrong filename**: ALWAYS use the exact name the user asked for
- **Inline python**: NEVER run multi-line Python with `python3 -c` — write a .py file instead
- **Overwriting data with formulas**: Write data cells and formula cells to DIFFERENT rows/columns
- **Off-by-one in formula ranges**: Header is row 1, data starts row 2. If 5 data rows, last data row is 6
- **Comparing formula cells**: Formula cells contain strings like `"=SUM(...)"`. Check the original numeric value, not the cell value, when applying conditional formatting
