---
name: pdf
description: PDF processing toolkit for extracting text/tables and creating new PDFs with Python
---

# PDF Processing Guide

## Extract Text and Tables (pdfplumber)

Use pdfplumber for all text and table extraction. Install: `pip install pdfplumber`

```python
import pdfplumber
import json

with pdfplumber.open("input.pdf") as pdf:
    all_text = ""
    all_tables = []

    for page in pdf.pages:
        # Extract text
        text = page.extract_text()
        if text:
            all_text += text + "\n"

        # Extract tables as list of lists
        tables = page.extract_tables()
        for table in tables:
            if table:
                headers = table[0]
                rows = [dict(zip(headers, row)) for row in table[1:]]
                all_tables.append({"headers": headers, "rows": rows})

# Save extracted data as JSON
with open("output.json", "w") as f:
    json.dump({"text": all_text, "tables": all_tables}, f, indent=2)
```

## Create PDFs (reportlab)

Use reportlab for PDF creation. Install: `pip install reportlab`

**CRITICAL: Call `doc.build(story)` exactly ONCE. Multiple build() calls overwrite the file.**

```python
import json
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []  # ALL content goes here

# Title page
story.append(Paragraph("Report Title", styles['Title']))
story.append(Spacer(1, 12))
story.append(Paragraph("Date: 2025-01-15", styles['Normal']))
story.append(PageBreak())

# Read data
with open("data.json") as f:
    data = json.load(f)

# Table with header and data rows
table_data = [['Name', 'Department', 'Salary']]  # header row
for item in data:
    table_data.append([item['name'], item['department'], f"${item['salary']:,}"])

table = Table(table_data)
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
]))
story.append(Paragraph("Employee Table", styles['Heading1']))
story.append(table)
story.append(PageBreak())

# Summary section
story.append(Paragraph("Summary", styles['Heading1']))
story.append(Paragraph("Total employees: 12", styles['Normal']))
story.append(Paragraph("Average salary: $84,500", styles['Normal']))

# Build PDF ONCE
doc.build(story)
```

## Quick Reference

| Task | Library | Install | Key API |
|------|---------|---------|---------|
| Extract text | pdfplumber | `pip install pdfplumber` | `page.extract_text()` |
| Extract tables | pdfplumber | `pip install pdfplumber` | `page.extract_tables()` |
| Create PDFs | reportlab | `pip install reportlab` | `SimpleDocTemplate` + `doc.build(story)` |
