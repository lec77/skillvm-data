---
name: docx
description: "Create, read, and extract data from Word documents (.docx). Use when creating new .docx files with headings/lists/tables, or extracting structured data from existing .docx files."
---

# DOCX Skill

## Critical Rules

1. **Save to the EXACT filename requested.**
2. **Write code to a file, then EXECUTE it.** Never stop after writing — always run the script.
3. **Use Python + `python-docx` for ALL document operations** (create, read, extract). It is always available.
4. **Use `pandoc --wrap=none -t markdown`** to convert docx to text (NOT `-t plain` which drops titles).
5. **For text extraction to .txt**: use python-docx to iterate ALL paragraphs and tables, writing everything to the output file. This captures headings that pandoc plain mode drops.

## Extracting Data from a DOCX

**Step 1:** Convert to readable format to understand structure:
```bash
pandoc --wrap=none input.docx -t markdown -o output.md
```

**Step 2:** Read output.md to understand document structure.

**Step 3:** Write a Python script to extract structured data:
```python
# extract.py
from docx import Document
import json, re

doc = Document("input.docx")

# Read paragraphs (includes headings)
for p in doc.paragraphs:
    print(repr(p.text))

# Read tables — each table has rows, each row has cells
for table in doc.tables:
    for row in table.rows:
        print([cell.text for cell in row.cells])

# Parse currency: "$1,234.56" → 1234.56
def parse_currency(s):
    return float(re.sub(r'[$,]', '', s))
```

**Step 4:** Run the script: `python extract.py`

**Key:** Read first, then extract. Convert docx → markdown, read it, write extraction code, then run it.

## Creating a DOCX

Write a Python script using `python-docx`, run it, then extract text for verification.

### Complete Working Example

Creates a document with title, paragraph, bullet list, and table:

```python
# create_doc.py
from docx import Document

doc = Document()

# Title heading (level=1 for reliable text extraction)
doc.add_heading('My Report Title', level=1)

# Paragraph
doc.add_paragraph('Report for the Engineering department.')

# Section heading
doc.add_heading('Team Members', level=2)

# Bullet list
for name in ['Alice (Lead)', 'Bob (Dev)', 'Carol (QA)']:
    doc.add_paragraph(name, style='List Bullet')

# Section heading
doc.add_heading('Milestones', level=2)

# Table with header row + data rows
table = doc.add_table(rows=1, cols=3)
table.style = 'Table Grid'
for i, h in enumerate(['Milestone', 'Status', 'Date']):
    table.rows[0].cells[i].text = h

for row_data in [('Design', 'Done', '2026-01-15'), ('Testing', 'Planned', '2026-03-20')]:
    cells = table.add_row().cells
    for i, val in enumerate(row_data):
        cells[i].text = val

doc.save('report.docx')
```

### Text Extraction (captures ALL content including headings)

```python
# extract_text.py
from docx import Document

doc = Document('report.docx')
lines = []

# Paragraphs include headings
for p in doc.paragraphs:
    if p.text.strip():
        lines.append(p.text)

# Tables
for table in doc.tables:
    for row in table.rows:
        lines.append('\t'.join(cell.text for cell in row.cells))

with open('report_text.txt', 'w') as f:
    f.write('\n'.join(lines))
```

Or use pandoc (but `-t markdown` not `-t plain`):
```bash
pandoc --wrap=none report.docx -t markdown -o report_text.txt
```

## Quick Reference

| Task | Code |
|------|------|
| Title heading | `doc.add_heading('Title', level=1)` |
| Section heading | `doc.add_heading('Section', level=2)` |
| Paragraph | `doc.add_paragraph('text')` |
| Bullet item | `doc.add_paragraph('item', style='List Bullet')` |
| Table | `table = doc.add_table(rows=1, cols=3)` then `table.style = 'Table Grid'` |
| Add table row | `cells = table.add_row().cells` then `cells[i].text = val` |
| Save | `doc.save('filename.docx')` |
| Read text | iterate `doc.paragraphs` + `doc.tables` |
