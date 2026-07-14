---
name: docx
description: "Create, read, and extract data from Word .docx files. Use when working with .docx documents: creating new documents, extracting text or data, reading content. Covers docx-js for creation and pandoc/python-docx for reading."
---

# DOCX Document Workflows

## Task Decision

| Task | Method |
|------|--------|
| **Create new .docx** | Write a Node.js script using the `docx` npm package (already installed globally). See "Creating Documents" below. |
| **Read/extract text from .docx** | Use `pandoc file.docx -t plain -o output.txt` OR use `python-docx` in Python. See "Reading Documents" below. |
| **Extract structured data from .docx** | Use `python-docx` to read paragraphs and tables, then write JSON. See "Extracting Structured Data" below. |

---

## Creating Documents with docx-js (Node.js)

ALWAYS write a `.js` file and run it with `node`. The `docx` package is installed globally.

### Minimal Working Example

```javascript
const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, AlignmentType, LevelFormat, BorderStyle, WidthType,
        ShadingType } = require("docx");

const doc = new Document({
  numbering: {
    config: [{
      reference: "bullet-list",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    }]
  },
  sections: [{
    children: [
      // Heading
      new Paragraph({ heading: HeadingLevel.HEADING_1,
        children: [new TextRun("My Title")] }),
      // Normal paragraph
      new Paragraph({ children: [new TextRun("Some text here.")] }),
      // Bullet item
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("Bullet point")] }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => fs.writeFileSync("output.docx", buf));
```

### Tables

```javascript
const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };

new Table({
  columnWidths: [3120, 3120, 3120], // 3 equal columns (9360 total for letter)
  rows: [
    new TableRow({
      children: [
        new TableCell({ borders, width: { size: 3120, type: WidthType.DXA },
          shading: { fill: "D9E2F3", type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: "Header", bold: true })] })] }),
        // ... more cells
      ]
    }),
    new TableRow({
      children: [
        new TableCell({ borders, width: { size: 3120, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun("Data")] })] }),
        // ... more cells
      ]
    })
  ]
})
```

### CRITICAL RULES — NEVER VIOLATE
- **NEVER use `\n` in TextRun** — use separate Paragraph objects for each line
- **NEVER use unicode bullet characters** like `"• Item"` — ALWAYS use numbering config with `LevelFormat.BULLET`
- **ALWAYS use `ShadingType.CLEAR`** for table cell shading (NOT `.SOLID` — causes black background)
- **ALWAYS set `columnWidths` on Table AND `width` on each TableCell**
- **ALWAYS put TextRun inside Paragraph children** — never use string directly
- Measurements are in DXA: 1440 = 1 inch. Letter usable width with 1" margins = 9360

### After Creating the .docx — Extract Text

If asked to also produce a plain text file, run:
```bash
pandoc output.docx -t plain -o output_text.txt
```
If pandoc is unavailable, write a Python script:
```python
from docx import Document
doc = Document("output.docx")
with open("output_text.txt", "w") as f:
    for p in doc.paragraphs:
        f.write(p.text + "\n")
    for table in doc.tables:
        for row in table.rows:
            f.write("\t".join(cell.text for cell in row.cells) + "\n")
```

---

## Reading Documents

### Plain text extraction
```bash
pandoc input.docx -t plain -o output.txt
```

### Python (python-docx)
```python
from docx import Document
doc = Document("input.docx")
for p in doc.paragraphs:
    print(p.text)
for table in doc.tables:
    for row in table.rows:
        print([cell.text for cell in row.cells])
```

Install if needed: `pip install python-docx`

---

## Extracting Structured Data from .docx

When asked to extract data from a .docx into JSON:

1. **Read the document** using python-docx
2. **Parse paragraphs** — look for key: value patterns, headings, metadata
3. **Parse tables** — iterate rows/cells to extract tabular data
4. **Write JSON** with `json.dump()`

### Example: Extract invoice data

```python
import json
from docx import Document

doc = Document("invoice.docx")

data = {}
# Read paragraphs for metadata
for p in doc.paragraphs:
    text = p.text.strip()
    if ":" in text:
        key, _, value = text.partition(":")
        key = key.strip().lower()
        value = value.strip()
        # Map to desired fields
        if "invoice" in key and "#" in key:
            data["invoice_number"] = value
        elif key == "date":
            data["date"] = value
        # ... etc

# Read tables for line items
for table in doc.tables:
    headers = [cell.text.strip().lower() for cell in table.rows[0].cells]
    items = []
    for row in table.rows[1:]:
        cells = [cell.text.strip() for cell in row.cells]
        item = dict(zip(headers, cells))
        items.append(item)
    data["line_items"] = items

with open("invoice_data.json", "w") as f:
    json.dump(data, f, indent=2)
```

### IMPORTANT for JSON extraction
- Convert numeric strings to actual numbers: use `int()` or `float()` for quantities, prices, totals
- Remove currency symbols (`$`, `,`) before converting: `float(value.replace("$","").replace(",",""))`
- Tax rates should be decimal (0.08 not 8%)
- Preserve exact string values for invoice numbers, dates, names
- Parse ALL paragraphs — data may appear in headings, bold text, or plain paragraphs
- Check both `p.text` and individual `run.text` if text parsing is tricky

---

## Dependencies (pre-installed or install if needed)

| Tool | Install |
|------|---------|
| docx (npm) | `npm install -g docx` |
| pandoc | `brew install pandoc` or `apt-get install pandoc` |
| python-docx | `pip install python-docx` |
