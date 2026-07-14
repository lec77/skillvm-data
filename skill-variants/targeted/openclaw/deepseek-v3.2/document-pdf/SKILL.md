---
name: pdf
description: PDF toolkit for extracting text/tables and creating PDFs with Python. Use pdfplumber for extraction and reportlab for creation.
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
import json

with pdfplumber.open("document.pdf") as pdf:
    all_tables = []
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if table and len(table) > 1:
                headers = table[0]
                rows = [dict(zip(headers, row)) for row in table[1:]]
                all_tables.append(rows)

with open("output.json", "w") as f:
    json.dump(all_tables, f, indent=2)
```

## Read PDFs (pypdf)

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")

text = ""
for page in reader.pages:
    text += page.extract_text()
```

## Create PDFs (reportlab)

### With Tables and Styled Content
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

# Body text
story.append(Paragraph("Report content here.", styles['Normal']))
story.append(Spacer(1, 12))

# Table with styling
data = [
    ['Name', 'Department', 'Salary'],
    ['Alice', 'Engineering', '$95,000'],
    ['Bob', 'Marketing', '$82,000'],
]
table = Table(data)
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 12),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
]))
story.append(table)

# New page
story.append(PageBreak())
story.append(Paragraph("Summary", styles['Heading1']))
story.append(Paragraph("Summary content here.", styles['Normal']))

doc.build(story)
```

### Basic Canvas API
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("output.pdf", pagesize=letter)
width, height = letter

c.drawString(100, height - 100, "Hello World!")
c.line(100, height - 120, 400, height - 120)
c.save()
```

## Merge/Split PDFs (pypdf)

```python
from pypdf import PdfWriter, PdfReader

# Merge
writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)
with open("merged.pdf", "wb") as f:
    writer.write(f)

# Split - one page per file
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as f:
        writer.write(f)
```

## Quick Reference

| Task | Library | Key API |
|------|---------|---------|
| Extract text | pdfplumber | `page.extract_text()` |
| Extract tables | pdfplumber | `page.extract_tables()` |
| Create PDFs | reportlab | `SimpleDocTemplate` + `Table` |
| Read/merge/split | pypdf | `PdfReader` / `PdfWriter` |
