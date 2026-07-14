---
name: pdf
description: Extract text/tables from PDFs and create new PDFs using Python.
---

# PDF Processing

## Extract Text and Tables

Use `pdfplumber` to extract text and tables from PDFs:

```python
import pdfplumber
import json

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        # Extract text
        text = page.extract_text()
        print(text)

        # Extract tables as list of rows
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                print(row)
```

Parse extracted text to build structured data, then save as JSON:

```python
import json

data = {"key": extracted_values}
with open("output.json", "w") as f:
    json.dump(data, f, indent=2)
```

## Create PDFs with reportlab

Use `reportlab` to create PDFs with tables:

```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

# Title
story.append(Paragraph("Report Title", styles['Title']))
story.append(Spacer(1, 12))

# Table
data = [
    ["Name", "Department", "Salary"],
    ["Alice", "Engineering", "$95,000"],
]
table = Table(data)
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
]))
story.append(table)

# New page
story.append(PageBreak())
story.append(Paragraph("Summary", styles['Heading1']))

doc.build(story)
```

## Install

```bash
pip install pdfplumber reportlab
```
