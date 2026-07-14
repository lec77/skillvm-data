---
name: docx
description: "Create, read, and extract data from Word documents (.docx). Covers creating new documents with the docx npm library and extracting text/data using pandoc or python-docx."
---

# DOCX Creation and Extraction

## Creating a New Word Document

Use the **docx** npm library (JavaScript/TypeScript) to create .docx files.

### Workflow
1. **Read [`docx-js.md`](docx-js.md)** for the full API reference and critical formatting rules.
2. Write a Node.js script using Document, Paragraph, TextRun, Table, etc.
3. Export with `Packer.toBuffer(doc)` and write to file.

### Quick Reference
```javascript
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, LevelFormat, AlignmentType } = require('docx');
const fs = require('fs');

const doc = new Document({
  numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
  sections: [{ children: [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Title")] }),
    new Paragraph({ children: [new TextRun("Body text")] }),
    new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Bullet item")] }),
    new Table({ rows: [
      new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun("Cell")] })] })
      ]})
    ]})
  ]}]
});
Packer.toBuffer(doc).then(buf => fs.writeFileSync("output.docx", buf));
```

**Critical rules**: Never use `\n` for line breaks (use separate Paragraphs). Use `LevelFormat.BULLET` constant for bullet lists. Each TableCell needs at least one Paragraph.

### Text Extraction After Creation
After creating a .docx file, extract text with:
```bash
pandoc input.docx -t plain -o output.txt
```

## Reading / Extracting Structured Data from a DOCX

When extracting structured data (especially tables) from a .docx file, **always use python-docx** — it provides direct access to document structure and is far more reliable than parsing plain text.

### Recommended: python-docx for structured extraction
```python
from docx import Document
import json, re

doc = Document("input.docx")

# Read paragraphs
for p in doc.paragraphs:
    text = p.text  # plain text of each paragraph

# Read tables - CRITICAL: use this for reliable table data extraction
for table in doc.tables:
    for row in table.rows:
        cells = [cell.text for cell in row.cells]
        # cells is a list like ["Item", "40", "$150.00", "$6,000.00"]
```

### Converting numeric strings
When extracting financial/numeric data from DOCX to JSON:
- Remove `$` and `,` before converting: `float(re.sub(r'[$,]', '', text))`
- Convert quantity strings to `int()` or `float()` — JSON output must have numeric types, not strings
- Parse percentage like "8%" as decimal: `0.08`

### Complete extraction pattern
```python
from docx import Document
import json, re

doc = Document("input.docx")

# 1. Extract paragraph-based fields
data = {}
for p in doc.paragraphs:
    text = p.text.strip()
    if text.startswith("Date:"):
        data["date"] = text.split(":", 1)[1].strip()
    # ... pattern match other fields

# 2. Extract table data
for table in doc.tables:
    headers = [cell.text.strip() for cell in table.rows[0].cells]
    items = []
    for row in table.rows[1:]:  # skip header row
        cells = [cell.text.strip() for cell in row.cells]
        items.append({
            "item": cells[0],
            "quantity": int(re.sub(r'[$,]', '', cells[1])),
            "unit_price": float(re.sub(r'[$,]', '', cells[2])),
            "total": float(re.sub(r'[$,]', '', cells[3]))
        })
    data["line_items"] = items

# 3. Write JSON
with open("output.json", "w") as f:
    json.dump(data, f, indent=2)
```

## Dependencies
- **docx**: `npm install -g docx` (creating documents)
- **pandoc**: text extraction/conversion
- **python-docx**: `pip install python-docx` (Python-based structured reading)
