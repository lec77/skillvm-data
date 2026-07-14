---
name: pdf
description: PDF processing toolkit for extracting text/tables and creating PDFs using Python.
license: Proprietary. LICENSE.txt has complete terms
---

# PDF Processing Guide

## Extract Text and Tables (pdfplumber)

```python
import pdfplumber
import json

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                print(row)
```

### Tables to Structured Data
```python
import pdfplumber
import pandas as pd
import json

with pdfplumber.open("document.pdf") as pdf:
    all_tables = []
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if table:
                df = pd.DataFrame(table[1:], columns=table[0])
                all_tables.append(df)

# Save as JSON
for df in all_tables:
    records = df.to_dict(orient="records")
    with open("extracted.json", "w") as f:
        json.dump(records, f, indent=2)
```

## Read PDF (pypdf)

```python
from pypdf import PdfReader

reader = PdfReader("document.pdf")
text = ""
for page in reader.pages:
    text += page.extract_text()
```

## Create PDFs (reportlab)

### Simple PDF with Text
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("output.pdf", pagesize=letter)
width, height = letter
c.drawString(100, height - 100, "Hello World!")
c.save()
```

### Professional Report with Tables
```python
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

# Title
story.append(Paragraph("Report Title", styles['Title']))
story.append(Spacer(1, 12))

# Table
data = [
    ['Name', 'Department', 'Salary'],
    ['Alice', 'Engineering', '$95,000'],
    ['Bob', 'Marketing', '$72,000'],
]
table = Table(data)
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
]))
story.append(table)

# Summary text
story.append(Spacer(1, 12))
story.append(Paragraph("Total employees: 2, Average salary: $83,500", styles['Normal']))

doc.build(story)
```

## Install Dependencies

```bash
pip install pypdf pdfplumber reportlab
```

## Quick Reference

| Task | Library | Key API |
|------|---------|---------|
| Extract text | pdfplumber | `page.extract_text()` |
| Extract tables | pdfplumber | `page.extract_tables()` |
| Read PDF metadata | pypdf | `PdfReader(f).metadata` |
| Create PDF | reportlab | `SimpleDocTemplate` + `Table` + `Paragraph` |
| Merge PDFs | pypdf | `PdfWriter().add_page(page)` |
