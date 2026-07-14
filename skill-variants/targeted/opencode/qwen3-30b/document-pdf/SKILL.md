---
name: pdf
description: PDF extraction and creation using Python scripts. Write and run Python scripts for all PDF operations — never try to read PDF files directly.
---

# PDF Processing

IMPORTANT: PDF files are binary. You CANNOT read them with a text file reader. You MUST write a Python script and run it with `python3` to process any PDF.

## Extract text and tables from PDF

Write a Python script using `pdfplumber`. Run `pip install pdfplumber` first.

```python
#!/usr/bin/env python3
import pdfplumber
import json

with pdfplumber.open("input.pdf") as pdf:
    all_text = ""
    all_tables = []
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            all_text += text + "\n"
        tables = page.extract_tables()
        for table in tables:
            all_tables.append(table)

# Process tables into structured data
for table in all_tables:
    headers = table[0]
    rows = [dict(zip(headers, row)) for row in table[1:]]
    print(json.dumps(rows, indent=2))

# Save to JSON
with open("output.json", "w") as f:
    json.dump({"text": all_text, "tables": all_tables}, f, indent=2)
```

## Create PDF with reportlab

Write a Python script using `reportlab`. Run `pip install reportlab` first.

Always use reportlab for PDF creation. Do NOT ask the user which library to use.

```python
#!/usr/bin/env python3
import json
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

doc = SimpleDocTemplate("output.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

# Title page
story.append(Paragraph("Report Title", styles['Title']))
story.append(Spacer(1, 12))
story.append(Paragraph("Date: 2025-01-15", styles['Normal']))
story.append(PageBreak())

# Data table
data = [
    ['Name', 'Department', 'Salary'],
    ['Alice', 'Engineering', '$95,000'],
    ['Bob', 'Marketing', '$72,000'],
]
t = Table(data)
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
]))
story.append(t)
story.append(Spacer(1, 12))

# Summary section
story.append(Paragraph("Summary", styles['Heading1']))
story.append(Paragraph("Total: 12", styles['Normal']))
story.append(Paragraph("Average Salary: $84,500", styles['Normal']))

doc.build(story)
```

## Merge/Split PDFs

Use `pypdf`. Run `pip install pypdf` first.

```python
from pypdf import PdfWriter, PdfReader

# Merge
writer = PdfWriter()
for f in ["a.pdf", "b.pdf"]:
    for page in PdfReader(f).pages:
        writer.add_page(page)
with open("merged.pdf", "wb") as f:
    writer.write(f)
```

## Rules

- NEVER read PDF files with text tools — always use Python scripts
- For extraction: write a script using pdfplumber
- For creation: write a script using reportlab
- For merge/split: write a script using pypdf
- Install libraries with pip before using them
- Never ask the user which library to use — just pick the right one
