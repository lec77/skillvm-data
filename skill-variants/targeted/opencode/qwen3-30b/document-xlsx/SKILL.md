---
name: xlsx
description: "Spreadsheet creation, editing, and analysis with Excel formulas, formatting, and data visualization. Use when Claude needs to work with .xlsx/.xlsm files: creating spreadsheets with formulas, reading/analyzing Excel data, modifying existing workbooks, or building reports with formatting and formulas."
---

# Excel Spreadsheet Skill

## Critical Rules

1. **ALWAYS save to the EXACT filename the user requested.**
2. **ALWAYS use the write tool to create a complete .py file in one shot, then run it with bash.** NEVER use `python3 -c` for multi-line code. NEVER try to build the script incrementally with edit — write the ENTIRE script at once.
3. **Use openpyxl** for all spreadsheet operations. It is already installed.
4. When creating spreadsheets, use **Excel formulas** (`=SUM(...)`, `=AVERAGE(...)`) — keeps them dynamic.
5. **Apply red fill directly to cells** using `PatternFill` — do NOT use `ConditionalFormatting`. Check each cell's numeric value and set `cell.fill`.
6. **ALWAYS apply currency formatting** (`$#,##0`) to dollar/money cells and set column widths for readability. This is required for professional quality.

## Two Workflows

| Task Type | What to do |
|-----------|-----------|
| **Create** a new spreadsheet | Write a Python script that builds the xlsx with openpyxl |
| **Read/Analyze** an existing spreadsheet | Write a Python script that reads xlsx and outputs JSON/results |

## Workflow A: Create a Spreadsheet

Use the write tool to create a complete Python script, then run it. Follow this exact pattern:

```python
# create_report.py
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font

wb = Workbook()
ws = wb.active
ws.title = "Sheet Title"

# 1. Write headers (row 1)
headers = ["Label", "Col1", "Col2", "Col3", "Col4"]
for col, h in enumerate(headers, 1):
    ws.cell(row=1, column=col, value=h).font = Font(bold=True)

# 2. Write data rows (starting at row 2)
data = [
    ["Row1", 100, 200, 300, 400],
    ["Row2", 150, 250, 350, 450],
]
for r, row_data in enumerate(data, 2):
    for c, val in enumerate(row_data, 1):
        ws.cell(row=r, column=c, value=val)

last_data_row = 1 + len(data)  # header is row 1
num_cols = len(headers)

# 3. SUM row
sum_row = last_data_row + 1
ws.cell(row=sum_row, column=1, value="Total").font = Font(bold=True)
for col in range(2, num_cols + 1):
    letter = ws.cell(row=1, column=col).column_letter
    ws.cell(row=sum_row, column=col, value=f"=SUM({letter}2:{letter}{last_data_row})")

# 4. AVERAGE row
avg_row = sum_row + 1
ws.cell(row=avg_row, column=1, value="Average").font = Font(bold=True)
for col in range(2, num_cols + 1):
    letter = ws.cell(row=1, column=col).column_letter
    ws.cell(row=avg_row, column=col, value=f"=AVERAGE({letter}2:{letter}{last_data_row})")

# 5. Currency formatting on all numeric cells (data + formula rows)
for r in range(2, avg_row + 1):
    for c in range(2, num_cols + 1):
        ws.cell(row=r, column=c).number_format = '$#,##0'

# 6. Column widths for readability
for c in range(1, num_cols + 1):
    ws.column_dimensions[ws.cell(row=1, column=c).column_letter].width = 15

# 7. Red fill for cells below threshold
THRESHOLD = 50000
red = PatternFill(start_color="FFFF0000", end_color="FFFF0000", fill_type="solid")
for r in range(2, last_data_row + 1):
    for c in range(2, num_cols + 1):
        cell = ws.cell(row=r, column=c)
        if isinstance(cell.value, (int, float)) and cell.value < THRESHOLD:
            cell.fill = red

# 8. Save
wb.save("OUTPUT_FILENAME.xlsx")
print("Done")
```

Steps: (1) Use write tool to create the .py file with correct data. (2) Run with bash: `python3 create_report.py`. (3) Verify: `ls -la OUTPUT_FILENAME.xlsx`.

## Workflow B: Read and Analyze a Spreadsheet

Use the write tool to create a complete Python script, then run it. MUST use `data_only=True` when reading values. Follow this exact pattern:

```python
# analyze.py
import json
from openpyxl import load_workbook

wb = load_workbook("INPUT_FILE.xlsx", data_only=True)
ws = wb.active

# Read data rows: skip header (row 1), stop at empty/summary rows
rows = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if row[0] is None:
        break
    if isinstance(row[0], str) and row[0].strip().upper() in ("TOTAL", "SUM", "GRAND TOTAL"):
        break
    rows.append(row)
wb.close()

# --- Adapt the aggregation below to match the user's request ---

# Example: group by column index 1 (Category), sum column index 2 (Amount)
group_totals = {}
for row in rows:
    key = str(row[1])  # category column
    val = row[2]       # amount column
    if isinstance(val, (int, float)):
        group_totals[key] = group_totals.get(key, 0) + val

# Example: group by column index 0 (Month)
second_totals = {}
for row in rows:
    key = str(row[0])  # month column
    val = row[2]       # amount column
    if isinstance(val, (int, float)):
        second_totals[key] = second_totals.get(key, 0) + val

# Grand total
grand_total = sum(row[2] for row in rows if isinstance(row[2], (int, float)))

# Highest group
highest = max(group_totals, key=group_totals.get)

# Boolean rate (e.g., approval rate)
bool_col = 3  # column index for True/False column
true_count = sum(1 for row in rows if row[bool_col] is True or row[bool_col] == 1)
rate = round((true_count / len(rows)) * 100)

result = {
    "total_by_category": group_totals,
    "total_by_month": second_totals,
    "grand_total": grand_total,
    "highest_category": highest,
    "approval_rate": rate,
}

with open("OUTPUT_FILE.json", "w") as f:
    json.dump(result, f, indent=2)
print("Done")
```

Steps: (1) First read the xlsx file headers to understand column layout. (2) Use write tool to create the COMPLETE .py file adapted to the columns. (3) Run with bash: `python3 analyze.py`. (4) Verify: `cat OUTPUT_FILE.json`.

**IMPORTANT:** Use `values_only=True` in `iter_rows()` for analysis — this returns tuples of values (access by index like `row[0]`, `row[1]`), not cell objects. This avoids indentation/attribute errors.

## Key Patterns

| Task | Code |
|------|------|
| Bold header | `cell.font = Font(bold=True)` |
| Currency format | `cell.number_format = '$#,##0'` |
| Red fill | `cell.fill = PatternFill(start_color='FFFF0000', end_color='FFFF0000', fill_type='solid')` |
| SUM formula | `cell.value = '=SUM(B2:B6)'` |
| AVERAGE formula | `cell.value = '=AVERAGE(B2:B6)'` |
| Read xlsx values | `load_workbook("file.xlsx", data_only=True)` |
| Iterate rows as tuples | `ws.iter_rows(min_row=2, values_only=True)` |

## Common Mistakes to Avoid

- **Wrong filename**: ALWAYS use the exact name the user asked for
- **Inline python**: NEVER run multi-line Python with `python3 -c`
- **Editing scripts incrementally**: ALWAYS write the complete script in one shot with the write tool
- **Forgetting data_only=True**: When READING values, MUST use `load_workbook(path, data_only=True)`
- **Using cell objects when values_only=True**: With `values_only=True`, rows are tuples — use `row[0]` not `row[0].value`
- **Including summary rows in aggregation**: Stop reading at TOTAL/SUM/empty rows
