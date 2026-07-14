---
name: pdf
description: PDF extraction and creation using Python. Use pdfplumber for text/table extraction, reportlab for PDF creation.
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

### Table to structured data

```python
import pdfplumber, json

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            headers = [h.strip() if h else "" for h in table[0]]
            rows = []
            for row in table[1:]:
                rows.append({headers[i]: (cell.strip() if cell else "") for i, cell in enumerate(row)})
```

## Create PDFs (reportlab)

### Simple document with tables

```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

# Title
story.append(Paragraph("Report Title", styles['Title']))
story.append(Spacer(1, 12))

# Table
data = [["Name", "Value"], ["Row 1", "100"], ["Row 2", "200"]]
t = Table(data)
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
]))
story.append(t)
story.append(PageBreak())

doc.build(story)
```

## Read PDF text (pypdf)

```python
from pypdf import PdfReader

reader = PdfReader("document.pdf")
for page in reader.pages:
    print(page.extract_text())
```

## Quick Reference

| Task | Library | Key API |
|------|---------|---------|
| Extract text | pdfplumber | `page.extract_text()` |
| Extract tables | pdfplumber | `page.extract_tables()` |
| Create PDFs | reportlab | `SimpleDocTemplate` + `Table` |
| Read text | pypdf | `page.extract_text()` |
