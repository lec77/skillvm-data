---
name: pdf
description: PDF text extraction and PDF creation. Use pdftotext for extraction and Python reportlab for creation.
license: Proprietary. LICENSE.txt has complete terms
---

# PDF Processing

IMPORTANT: Always write Python code to a .py file first, then run it with `python script.py`. Never use `python -c` for multi-line scripts — shell escaping will break.

## Extract Text from PDF

```bash
pdftotext -layout input.pdf output.txt
```

Then read output.txt and parse the data. Write a Python script to parse and save as JSON:

```python
# save as parse_pdf.py, then run: python parse_pdf.py
import json

with open("output.txt") as f:
    text = f.read()

# Parse lines, split by whitespace to extract table columns
lines = text.strip().split("\n")
data = []
for line in lines:
    cols = line.split()
    # process columns as needed

with open("result.json", "w") as f:
    json.dump(data, f, indent=2)
```

## Create PDFs with reportlab

IMPORTANT: Write the script to a .py file first, then run it.

```python
# save as create_pdf.py, then run: python create_pdf.py
import json
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

# Load data
with open("data.json") as f:
    records = json.load(f)

doc = SimpleDocTemplate("output.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

# Title page
story.append(Paragraph("Report Title", styles['Title']))
story.append(Spacer(1, 12))
story.append(Paragraph("Date: 2025-01-15", styles['Normal']))
story.append(PageBreak())

# Build table data as list of lists
header = ['Name', 'Department', 'Salary']
table_data = [header]
for r in records:
    salary_str = "${:,.0f}".format(r['salary'])
    table_data.append([r['name'], r['department'], salary_str])

table = Table(table_data)
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
]))
story.append(table)
story.append(PageBreak())

# Summary
story.append(Paragraph("Summary", styles['Heading1']))
total = len(records)
avg = sum(r['salary'] for r in records) / total
story.append(Paragraph("Total: {} employees".format(total), styles['Normal']))
story.append(Paragraph("Average salary: ${:,.0f}".format(avg), styles['Normal']))

doc.build(story)
```

## Install Dependencies

```bash
pip install reportlab
```

## Quick Reference

| Task | Tool |
|------|------|
| Extract text | `pdftotext -layout file.pdf output.txt` |
| Parse tables | Read extracted text, split by whitespace |
| Create PDF | Write .py script using reportlab, run with python |
| Merge PDFs | pypdf PdfWriter + add_page |
