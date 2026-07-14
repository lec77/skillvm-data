---
name: pdf
description: Extract text/tables from PDFs and create new PDF reports using Python
---

# PDF Processing with Python

## Extract Text & Tables from PDF

Use `pdfplumber` to extract text and tables. Install: `pip install pdfplumber`

```python
import pdfplumber
import json

with pdfplumber.open("input.pdf") as pdf:
    # Extract all text
    full_text = ""
    for page in pdf.pages:
        full_text += page.extract_text() + "\n"

    # Extract tables as lists of rows
    all_tables = []
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            # table[0] is headers, table[1:] is data rows
            all_tables.append(table)

# Save extracted data as JSON
with open("output.json", "w") as f:
    json.dump({"text": full_text, "tables": all_tables}, f, indent=2)
```

**Table parsing tip:** When `extract_tables()` returns a table, row cells may contain `None` for empty cells. Clean numeric values by stripping `$`, `,`, `%` before converting to numbers.

```python
def clean_number(val):
    if val is None:
        return None
    val = val.strip().replace("$", "").replace(",", "").replace("%", "")
    try:
        return float(val) if "." in val else int(val)
    except ValueError:
        return val
```

## Create PDF Reports

Use `reportlab` to create PDFs with tables. Install: `pip install reportlab`

```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

# Title page
story.append(Paragraph("Report Title", styles['Title']))
story.append(Spacer(1, 12))
story.append(Paragraph("Date: 2025-01-15", styles['Normal']))
story.append(PageBreak())

# Table with data
data = [
    ["Name", "Department", "Salary"],
    ["Alice", "Engineering", "$95,000"],
    ["Bob", "Marketing", "$72,000"],
]
table = Table(data)
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
]))
story.append(table)
story.append(Spacer(1, 20))

# Summary paragraph
story.append(Paragraph("Summary", styles['Heading2']))
story.append(Paragraph("Total headcount: 2. Average salary: $83,500.", styles['Normal']))

doc.build(story)
```

## Read PDF Text (simple)

Use `pypdf` for quick text extraction. Install: `pip install pypdf`

```python
from pypdf import PdfReader

reader = PdfReader("document.pdf")
text = ""
for page in reader.pages:
    text += page.extract_text()
```
