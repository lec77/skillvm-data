---
name: pdf
description: PDF extraction and creation with Python
---

# PDF Processing

## Extract Text & Tables from PDF

Use `pdfplumber` for text and table extraction:

```python
import pdfplumber
import json

with pdfplumber.open("input.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        tables = page.extract_tables()
        for table in tables:
            # table[0] = headers, table[1:] = rows
            for row in table:
                print(row)
```

Convert extracted tables to structured data:

```python
import pdfplumber
import json

with pdfplumber.open("input.pdf") as pdf:
    all_text = ""
    all_tables = []
    for page in pdf.pages:
        all_text += (page.extract_text() or "") + "\n"
        tables = page.extract_tables()
        for table in tables:
            if table:
                headers = [h.strip() if h else "" for h in table[0]]
                rows = []
                for row in table[1:]:
                    rows.append({headers[i]: (cell.strip() if cell else "") for i, cell in enumerate(row)})
                all_tables.append({"headers": headers, "rows": rows})

# Save as JSON
with open("output.json", "w") as f:
    json.dump({"text": all_text, "tables": all_tables}, f, indent=2)
```

**Important**: When extracting numeric values from tables, remove any formatting characters (commas, dollar signs, percent signs) and convert to numbers:
```python
def clean_number(s):
    if not s: return 0
    return float(s.replace(",", "").replace("$", "").replace("%", "").strip())
```

## Create PDFs with reportlab

```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

doc = SimpleDocTemplate("output.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

# Title
story.append(Paragraph("Report Title", styles['Title']))
story.append(Spacer(1, 24))

# Table
data = [["Name", "Dept", "Salary"]]  # header row
data.append(["Alice", "Eng", "$95,000"])
table = Table(data)
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
]))
story.append(table)

# New page
story.append(PageBreak())

# Summary text
story.append(Paragraph("Summary Section", styles['Heading1']))
story.append(Paragraph("Total: 12, Average: $84,500", styles['Normal']))

doc.build(story)
```

## Writing Markdown Summaries from PDF Data

When asked to write a summary.md from extracted PDF data, always include:
1. **Formatted markdown tables** — reproduce all data tables using `| col1 | col2 |` markdown table syntax
2. **Key metrics** — highlight overall growth rates (e.g., "12% YoY growth"), top/bottom performers
3. **Regional/segment highlights** — call out notable trends per region or segment (e.g., "West region grew +18%", "East region declined -5%")
4. **Actionable recommendations** — include a "## Recommendations" section with 3-5 specific, actionable bullet points based on the data

Example summary structure:
```markdown
# Report Summary

## Overview
Brief description of the report with key headline metrics.

## Regional Revenue
| Region | Q1 | Q2 | Q3 | YTD Total | YoY Change |
|--------|....|....|....|-----------|------------|

## Key Findings
- Overall YTD revenue of $X with Y% YoY growth
- Strongest region: [name] with +Z% growth
- Weakest region: [name] with -W% decline

## Recommendations
1. Invest in [strongest growth area]
2. Investigate [declining area] issues
3. ...
```

## Install Dependencies

Always install required packages first. Use `--break-system-packages` if pip fails:
```bash
pip install pdfplumber reportlab pypdf
# If that fails:
pip install --break-system-packages pdfplumber reportlab pypdf
```

## Key Tips

- Use `pdfplumber` (not pypdf) for table extraction — it handles table structure much better
- Use `reportlab` for creating PDFs — use `SimpleDocTemplate` with `Platypus` for structured reports
- When creating PDFs with numeric values like salary averages, write the exact number (e.g., `$84,500` or `84500`)
- Always write numbers without rounding — use the exact computed values
