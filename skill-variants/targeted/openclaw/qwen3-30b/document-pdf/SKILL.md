---
name: pdf
description: PDF text/table extraction and PDF creation using Python libraries
---

# PDF Processing Guide

## Quick Start

```bash
pip install pdfplumber reportlab pypdf
```

```python
from pypdf import PdfReader

reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")
for page in reader.pages:
    print(page.extract_text())
```

## Extract Text and Tables with pdfplumber

Always use Python scripts for extraction, not the pdfplumber CLI.

### Extract Text
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

### Extract Tables
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for j, table in enumerate(tables):
            print(f"Table {j+1} on page {i+1}:")
            for row in table:
                print(row)
```

### Convert Tables to Structured Data

When converting extracted tables to JSON, capture EVERY column from the table. Map each header to a key. Do not skip any columns.

```python
import pdfplumber
import json

with pdfplumber.open("document.pdf") as pdf:
    all_tables = []
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if table and len(table) >= 2:
                headers = [h.strip() if h else "" for h in table[0]]
                rows = []
                for row in table[1:]:
                    entry = {}
                    for col_idx, header in enumerate(headers):
                        if col_idx < len(row) and header:
                            val = row[col_idx]
                            if val:
                                val = val.strip()
                                try:
                                    val = int(val.replace(",", "").replace("$", ""))
                                except ValueError:
                                    pass
                            entry[header] = val
                    rows.append(entry)
                all_tables.append({"headers": headers, "rows": rows})

with open("extracted.json", "w") as f:
    json.dump(all_tables, f, indent=2)
```

## Writing Good Summaries

When writing a markdown summary of PDF data:

1. **Include markdown tables** that reproduce the key data from the PDF
2. **Mention specific growth metrics** like YoY (year-over-year) growth percentages
3. **Highlight top/bottom performers** by region or segment
4. **Include actionable recommendations** based on data trends
5. Use clear section headings: Overview, Regional Performance, Product Analysis, Recommendations

## Create PDFs with reportlab

### Basic PDF with Tables
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

# Title page
story.append(Paragraph("Report Title", styles['Title']))
story.append(Spacer(1, 12))
story.append(Paragraph("Date: 2025-01-15", styles['Normal']))
story.append(PageBreak())

# Data table
data = [
    ["Name", "Department", "Salary"],
    ["Alice", "Engineering", "$95,000"],
    ["Bob", "Marketing", "$85,000"],
]
table = Table(data)
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
]))
story.append(table)
story.append(PageBreak())

# Summary section
story.append(Paragraph("Summary", styles['Heading1']))
story.append(Paragraph("Total employees: 12", styles['Normal']))

doc.build(story)
```

### Create PDF with Multiple Pages
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

story.append(Paragraph("Report Title", styles['Title']))
story.append(Spacer(1, 12))
story.append(PageBreak())

story.append(Paragraph("Page 2", styles['Heading1']))
story.append(Paragraph("Content for page 2", styles['Normal']))

doc.build(story)
```

## Quick Reference

| Task | Library | Key Function |
|------|---------|-------------|
| Extract text | pdfplumber | `page.extract_text()` |
| Extract tables | pdfplumber | `page.extract_tables()` |
| Create PDFs | reportlab | `SimpleDocTemplate` + `Table` |
| Read PDF | pypdf | `PdfReader` |
| Merge PDFs | pypdf | `PdfWriter.add_page()` |
