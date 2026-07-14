---
name: pdf
description: PDF text extraction, table extraction, and PDF creation using Python
---

# PDF Processing

## Extract Text and Tables (pdfplumber)

```python
import pdfplumber
import json

with pdfplumber.open("input.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                print(row)
```

Install: `pip install pdfplumber`

## Create PDFs (reportlab)

```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

doc = SimpleDocTemplate("output.pdf", pagesize=letter)
styles = getSampleStyleSheet()
elements = []

# Title
elements.append(Paragraph("Report Title", styles['Title']))
elements.append(Spacer(1, 12))

# Table with styling
data = [['Name', 'Value'], ['Row1', '100'], ['Row2', '200']]
table = Table(data)
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
]))
elements.append(table)

# New page
elements.append(PageBreak())

doc.build(elements)
```

Install: `pip install reportlab`

## Read PDF text (pypdf - lightweight)

```python
from pypdf import PdfReader
reader = PdfReader("input.pdf")
for page in reader.pages:
    print(page.extract_text())
```

Install: `pip install pypdf`

## Quick Reference

| Task | Library | Key Function |
|------|---------|-------------|
| Extract text | pdfplumber | `page.extract_text()` |
| Extract tables | pdfplumber | `page.extract_tables()` |
| Create PDF | reportlab | `SimpleDocTemplate` + `Table` |
| Read/merge/split | pypdf | `PdfReader` / `PdfWriter` |
