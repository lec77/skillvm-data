---
name: docx
description: "Create and extract data from .docx files"
license: Proprietary. LICENSE.txt has complete terms
---

# DOCX Creation and Data Extraction

## Creating a New Word Document

Use the **docx** npm package (JavaScript/TypeScript).

### Workflow
1. Read [`docx-js.md`](docx-js.md) for the API reference
2. Write a .js or .ts file using Document, Paragraph, TextRun, Table, etc.
3. Export with `Packer.toBuffer(doc)` and write to file

### Quick Example
```javascript
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, LevelFormat, AlignmentType, BorderStyle } = require('docx');
const fs = require('fs');

const doc = new Document({
  numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
  sections: [{ children: [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Title")] }),
    new Paragraph({ children: [new TextRun("Body text")] }),
    new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Bullet item")] }),
  ]}]
});
Packer.toBuffer(doc).then(buf => fs.writeFileSync("out.docx", buf));
```

## Extracting Text from a DOCX

Use **pandoc** with `--wrap=none` to prevent line-wrapping issues:

```bash
pandoc --wrap=none input.docx -o output.txt
# Or for markdown:
pandoc --wrap=none input.docx -o output.md
```

**IMPORTANT**: Always use `--wrap=none` to keep table cells and long lines on single lines.

## Extracting Structured Data from a DOCX

1. Convert to text with pandoc (`--wrap=none`)
2. Parse the text to extract fields
3. Write JSON output

Or use python-docx:
```python
from docx import Document
doc = Document('file.docx')
for para in doc.paragraphs:
    print(para.text)
for table in doc.tables:
    for row in table.rows:
        for cell in row.cells:
            print(cell.text)
```

## Dependencies
- **docx**: `npm install -g docx` (for creating documents)
- **pandoc**: for text extraction (usually pre-installed)
- **python-docx**: `pip install python-docx` (alternative for reading)
