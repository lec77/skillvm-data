---
name: pdf
description: PDF processing toolkit for extracting text/tables and creating PDFs. Use when working with PDF documents — extracting data, creating reports, merging, or splitting.
---

# PDF Processing

## Extract Text and Tables (pdfplumber)

ALWAYS use `pdfplumber` for text and table extraction. It handles layouts and tables better than pypdf.

```python
import pdfplumber
import json

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        # Extract text
        text = page.extract_text()
        # Extract tables as list of lists
        tables = page.extract_tables()
        for table in tables:
            # table[0] = header row, table[1:] = data rows
            header = table[0]
            for row in table[1:]:
                print(dict(zip(header, row)))
```

### Save extracted tables as JSON
```python
import pdfplumber, json

with pdfplumber.open("input.pdf") as pdf:
    all_tables = []
    for page in pdf.pages:
        for table in page.extract_tables():
            if table and len(table) > 1:
                header = table[0]
                rows = [dict(zip(header, row)) for row in table[1:]]
                all_tables.append(rows)
    with open("output.json", "w") as f:
        json.dump(all_tables, f, indent=2)
```

## Create PDFs (reportlab)

ALWAYS use `reportlab` for creating PDFs from scratch. Use Platypus for structured documents with tables.

### Document with tables
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

# Table with header styling
data = [['Name', 'Dept', 'Salary'],
        ['Alice', 'Eng', '$95,000'],
        ['Bob', 'Sales', '$78,000']]
table = Table(data)
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
]))
story.append(table)
story.append(PageBreak())  # New page

doc.build(story)
```

## Read/Modify PDFs (pypdf)

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
print(f"Pages: {len(reader.pages)}")

# Extract text
for page in reader.pages:
    text = page.extract_text()

# Merge PDFs
writer = PdfWriter()
for pdf_file in ["a.pdf", "b.pdf"]:
    for page in PdfReader(pdf_file).pages:
        writer.add_page(page)
with open("merged.pdf", "wb") as f:
    writer.write(f)
```

## Quick Reference

| Task | Tool | Key API |
|------|------|---------|
| Extract text | pdfplumber | `page.extract_text()` |
| Extract tables | pdfplumber | `page.extract_tables()` |
| Create PDF | reportlab | `SimpleDocTemplate` + `Table` |
| Read/merge/split | pypdf | `PdfReader` / `PdfWriter` |
| CLI text extract | poppler | `pdftotext -layout input.pdf out.txt` |
| CLI merge | qpdf | `qpdf --empty --pages f1.pdf f2.pdf -- out.pdf` |
