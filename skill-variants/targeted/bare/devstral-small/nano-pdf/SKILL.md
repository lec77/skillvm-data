---
name: pdf
description: Extract text/tables from PDFs and create new PDFs using Python.
---

# PDF Processing

## Extract Text and Tables

Use `pdfplumber` to extract text and tables from PDFs:

```python
import pdfplumber
import json

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                print(row)
```

Parse extracted text to build structured data, then save as JSON:

```python
import json

data = {"key": extracted_values}
with open("output.json", "w") as f:
    json.dump(data, f, indent=2)
```

When parsing tabular data from PDF text (like regional breakdowns), split lines and parse columns:
```python
for line in text.split("\n"):
    parts = line.split()
    if parts and parts[0] in ["North","South","East","West"]:
        name = parts[0]
        revenue = int(parts[1].replace("$","").replace(",",""))
        growth = float(parts[2].replace("%",""))
```

## Extract Document Info (titles, authors)

PDF metadata fields are often empty. ALWAYS extract titles and authors from the TEXT content instead:

```python
import pdfplumber

with pdfplumber.open("doc.pdf") as pdf:
    page1_text = pdf.pages[0].extract_text()
    lines = [l.strip() for l in page1_text.split("\n") if l.strip()]
    title = lines[0]  # first non-empty line is the title
    author = ""
    for line in lines:
        if "Author:" in line:
            author = line.split("Author:")[-1].strip()
```

## Merge PDFs with pypdf

```python
from pypdf import PdfReader, PdfWriter

writer = PdfWriter()
for path in ["file1.pdf", "file2.pdf"]:
    reader = PdfReader(path)
    page_count = len(reader.pages)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as f:
    writer.write(f)
```

## Create PDFs with reportlab

```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

story.append(Paragraph("Report Title", styles['Title']))
story.append(Spacer(1, 12))

data = [
    ["Name", "Department", "Salary"],
    ["Alice", "Engineering", "$95,000"],
]
table = Table(data)
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
]))
story.append(table)

doc.build(story)
```

## Install

```bash
pip install pdfplumber pypdf reportlab
```
