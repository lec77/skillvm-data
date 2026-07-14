---
name: pdf
description: PDF processing toolkit for extracting text/tables and creating new PDFs with Python
license: Proprietary. LICENSE.txt has complete terms
---

# PDF Processing Guide

## Extract Text and Tables (pdfplumber)

```python
import pdfplumber, json

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)

        tables = page.extract_tables()
        for table in tables:
            if table:
                headers = table[0]
                rows = [dict(zip(headers, row)) for row in table[1:]]
```

Install: `pip install pdfplumber`

## Create PDFs (reportlab)

**CRITICAL: Call `doc.build(story)` exactly ONCE with ALL content in a single list. Multiple build() calls overwrite the file — only the last call survives.**

```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []  # ALL content goes in this single list

# Title page
story.append(Paragraph("Report Title", styles['Title']))
story.append(Spacer(1, 12))
story.append(Paragraph("Date: 2025-01-15", styles['Normal']))
story.append(PageBreak())  # New page

# Table
data = [
    ['Name', 'Dept', 'Salary'],
    ['Alice', 'Eng', '$95,000'],
    ['Bob', 'Sales', '$72,000'],
]
table = Table(data)
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
]))
story.append(table)
story.append(PageBreak())

# Summary section
story.append(Paragraph("Summary", styles['Heading1']))
story.append(Paragraph("Total: 12 employees", styles['Normal']))

# Build ONCE with all content
doc.build(story)
```

Install: `pip install reportlab`

## Read PDF text (pypdf)

```python
from pypdf import PdfReader

reader = PdfReader("document.pdf")
for page in reader.pages:
    text = page.extract_text()
    print(text)
```

Install: `pip install pypdf`

## Quick Reference

| Task | Library | Key API |
|------|---------|---------|
| Extract text | pdfplumber | `page.extract_text()` |
| Extract tables | pdfplumber | `page.extract_tables()` |
| Create PDFs | reportlab | `SimpleDocTemplate` + `doc.build(story)` |
| Read text (simple) | pypdf | `PdfReader` + `page.extract_text()` |
