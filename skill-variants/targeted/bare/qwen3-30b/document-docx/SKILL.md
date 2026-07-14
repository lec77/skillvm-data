---
name: docx
description: "Create and extract data from .docx files using docx-js (JavaScript) and python-docx (Python)"
---

# DOCX Document Skills

**CRITICAL: Always write all output files to disk. Never just print results — save them to the requested filenames.**

## Creating a New DOCX

Use the **docx** npm library (JavaScript/TypeScript).

### Steps
1. Read [`docx-js.md`](docx-js.md) for the full API reference
2. Write a .js script that creates the document using Document, Paragraph, TextRun, Table, etc.
3. Run: `node script.js`
4. The script must call `Packer.toBuffer(doc)` and write the buffer with `fs.writeFileSync`

### Minimal Example
```javascript
const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, LevelFormat, AlignmentType } = require("docx");

const doc = new Document({
  numbering: { config: [{ reference: "bullets",
    levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
  sections: [{ children: [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Title")] }),
    new Paragraph({ children: [new TextRun("Body text.")] }),
    new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Bullet item")] }),
  ]}]
});
Packer.toBuffer(doc).then(buf => fs.writeFileSync("output.docx", buf));
```

### Extracting Text from a DOCX

**ALWAYS use this python3 method** to extract text (preserves all text without line wrapping):

```bash
python3 -c "
from docx import Document
doc = Document('INPUTFILE.docx')
with open('OUTPUTFILE.txt', 'w') as f:
    for p in doc.paragraphs:
        f.write(p.text + '\n')
    for t in doc.tables:
        for row in t.rows:
            f.write('\t'.join(c.text for c in row.cells) + '\n')
"
```

Replace INPUTFILE.docx and OUTPUTFILE.txt with actual filenames.

**Do NOT use pandoc for text extraction** — it wraps long lines and corrupts the output.

## Reading/Extracting Data from a DOCX

To extract structured data from a .docx file:

### Steps
1. Use the python3 extraction script above to convert .docx to .txt
2. Read the text file to understand the content
3. Parse the data and write structured output (JSON, etc.) to disk using write_file

**Key rule**: Numbers in JSON must be actual numbers, not strings. Strip currency symbols ($) and commas before converting: `parseFloat("$1,234.56".replace(/[$,]/g, ""))`.

## Dependencies
- **python-docx**: Text extraction (`pip install python-docx` if needed)
- **docx**: Document creation (`npm install -g docx` if needed)
