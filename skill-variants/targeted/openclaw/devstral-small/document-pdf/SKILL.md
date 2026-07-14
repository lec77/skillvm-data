---
name: pdf
description: PDF extraction and creation with Python scripts. Always write .py files and run with python3.
license: Proprietary. LICENSE.txt has complete terms
---

# PDF Processing

**IMPORTANT: Always write a Python .py file and run it with `python3 script.py`. Do NOT use pdfplumber or other tools as CLI commands.**

## Extract Text & Tables from PDF

Write a script like `extract.py` and run it with `python3 extract.py`:

```python
import pdfplumber
import json

with pdfplumber.open("input.pdf") as pdf:
    all_text = ""
    all_tables = []
    for page in pdf.pages:
        all_text += page.extract_text() or ""
        tables = page.extract_tables()
        for table in tables:
            # table[0] = header row, table[1:] = data rows
            all_tables.append(table)

# Save extracted data
with open("output.json", "w") as f:
    json.dump({"text": all_text, "tables": all_tables}, f, indent=2)
```

## Create PDF Reports

Write a script like `create_pdf.py` and run it with `python3 create_pdf.py`:

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
story.append(Paragraph("Subtitle or date", styles['Normal']))
story.append(PageBreak())

# Data table
data = [["Name", "Department", "Salary"],
        ["Alice", "Engineering", "$95,000"],
        ["Bob", "Marketing", "$72,000"]]
t = Table(data)
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
]))
story.append(t)
story.append(Spacer(1, 12))

# Summary text
story.append(Paragraph("Summary: Total employees: 2", styles['Normal']))

doc.build(story)
print("PDF created successfully")
```

## Tool Selection

| Task | Library | Install |
|------|---------|---------|
| Extract text | pdfplumber | `pip install pdfplumber` |
| Extract tables | pdfplumber | `pip install pdfplumber` |
| Create PDF | reportlab | `pip install reportlab` |
| Read/merge/split | pypdf | `pip install pypdf` |
