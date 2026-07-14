---
name: docx
description: "Create and extract data from Word documents (.docx). Use docx-js for creation, python-docx for reading."
---

# DOCX: Create and Extract

## CRITICAL RULES
1. **NEVER read a .docx file directly** - it is a binary ZIP file and will show garbage
2. **NEVER use `python3 -c`** for multiline code - always write a .py file first
3. **ALWAYS write scripts to files first**, then execute them

## Creating a New DOCX

**MANDATORY FIRST STEP: Read the file `docx-js.md` completely before writing any code.** It contains the correct API syntax - without reading it, your code WILL be wrong.

After reading docx-js.md, write a .js file and run it with `node yourfile.js`.

After creating the .docx, extract text with:
```bash
pandoc -f docx -t plain report.docx -o report_text.txt
```

## Extracting Data from a DOCX

**DO NOT read the .docx file. Write a Python script file (.py) immediately.**

**Step 1: Write explore.py and run it to see the document contents:**
```python
import docx

doc = docx.Document("invoice.docx")

print("=== PARAGRAPHS ===")
for i, p in enumerate(doc.paragraphs):
    print(f"[{i}] {repr(p.text)}")

print("=== TABLES ===")
for ti, table in enumerate(doc.tables):
    print(f"Table {ti}:")
    for ri, row in enumerate(table.rows):
        cells = [cell.text for cell in row.cells]
        print(f"  Row {ri}: {cells}")
```
Run: `python3 explore.py`

**Step 2: Write extract.py based on what you see, then run it.**

Example extraction script (adapt to match actual document format):
```python
import docx
import json

doc = docx.Document("invoice.docx")
data = {}

for p in doc.paragraphs:
    t = p.text.strip()
    if not t:
        continue
    if "Invoice" in t and "#" in t:
        data["invoice_number"] = t.split("#")[1].strip()
    elif t.startswith("Date:"):
        data["date"] = t.split(": ", 1)[1].strip()
    elif t.startswith("From:"):
        data["from"] = t.split(": ", 1)[1].strip()
    elif t.startswith("To:"):
        data["to"] = t.split(": ", 1)[1].strip()
    elif t.startswith("Subtotal"):
        data["subtotal"] = float(t.split("$")[1].replace(",", ""))
    elif "Tax" in t and "%" in t:
        pct = ""
        for c in t:
            if c.isdigit() or c == ".":
                pct += c
        if pct:
            data["tax_rate"] = float(pct) / 100
    elif "Tax" in t and "$" in t:
        data["tax_amount"] = float(t.split("$")[1].replace(",", ""))
    elif "Total" in t and "$" in t:
        data["total_due"] = float(t.split("$")[1].replace(",", ""))
    elif t.startswith("Payment"):
        data["payment_terms"] = t.split(": ", 1)[1].strip()
    elif t.startswith("Due Date"):
        data["due_date"] = t.split(": ", 1)[1].strip()

line_items = []
if doc.tables:
    for row in doc.tables[0].rows[1:]:
        cells = [cell.text.strip() for cell in row.cells]
        if len(cells) >= 4 and cells[0]:
            line_items.append({
                "item": cells[0],
                "quantity": int(float(cells[1].replace(",", ""))),
                "unit_price": float(cells[2].replace("$", "").replace(",", "")),
                "total": float(cells[3].replace("$", "").replace(",", ""))
            })
data["line_items"] = line_items

with open("invoice_data.json", "w") as f:
    json.dump(data, f, indent=2)
print("Saved to invoice_data.json")
```
Run: `python3 extract.py`

**Step 3: Read invoice_data.json to verify all fields are correct.**

## Dependencies
- **docx**: `npm install docx` (creating documents)
- **python-docx**: `pip install python-docx` (reading documents)
- **pandoc**: text extraction (usually pre-installed)
