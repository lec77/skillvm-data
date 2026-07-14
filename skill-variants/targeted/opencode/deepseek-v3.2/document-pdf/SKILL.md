---
name: pdf
description: PDF processing — extract text/tables and create PDFs using Python
---

# PDF Processing Guide

## Extract Text and Tables (pdfplumber)

```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                print(row)
```

Convert tables to pandas DataFrames:

```python
import pandas as pd
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        for table in page.extract_tables():
            if table:
                df = pd.DataFrame(table[1:], columns=table[0])
```

## Create PDFs (reportlab)

### Simple PDF with Canvas

```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("output.pdf", pagesize=letter)
width, height = letter
c.drawString(100, height - 100, "Hello World!")
c.save()
```

### Structured PDF with Platypus

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
data = [["Name", "Value"], ["Item 1", "100"], ["Item 2", "200"]]
table = Table(data)
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
]))
story.append(table)

doc.build(story)
```

## Basic Operations (pypdf)

```python
from pypdf import PdfReader, PdfWriter

# Read and extract text
reader = PdfReader("document.pdf")
for page in reader.pages:
    text = page.extract_text()

# Merge PDFs
writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)
with open("merged.pdf", "wb") as f:
    writer.write(f)
```

## Quick Reference

| Task | Library | Key API |
|------|---------|---------|
| Extract text | pdfplumber | `page.extract_text()` |
| Extract tables | pdfplumber | `page.extract_tables()` |
| Create PDFs | reportlab | `SimpleDocTemplate` + Platypus |
| Merge/split | pypdf | `PdfWriter.add_page()` |
| Read metadata | pypdf | `reader.metadata` |
