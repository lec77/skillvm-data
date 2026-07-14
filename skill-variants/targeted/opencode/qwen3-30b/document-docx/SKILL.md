---
name: docx
description: "Create and extract .docx files. Creating uses docx npm package (JavaScript). Extracting uses pandoc to convert to text then parse."
---

# DOCX: Create and Extract

## Creating a new .docx document

Use the `docx` npm package. Read [`docx-js.md`](docx-js.md) for the API reference, then write a Node.js script.

**Steps:**
1. Read `docx-js.md` for syntax
2. Write a `.js` file that builds the document
3. Run it with `node script.js`
4. The script must call `Packer.toBuffer(doc)` and write the buffer to the output file

**Complete working example** — a report with heading, paragraph, bullet list, and table:

```javascript
const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, AlignmentType, LevelFormat, WidthType, BorderStyle } = require("docx");

const border = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: border, bottom: border, left: border, right: border };

const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    }]
  },
  sections: [{
    children: [
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Title Here")] }),
      new Paragraph({ children: [new TextRun("Body paragraph text.")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Section")] }),
      // Bullet list items
      new Paragraph({ numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Item 1")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Item 2")] }),
      // Table
      new Table({
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 3000, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "Col1", bold: true })] })] }),
            new TableCell({ borders, width: { size: 3000, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "Col2", bold: true })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 3000, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun("Data1")] })] }),
            new TableCell({ borders, width: { size: 3000, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun("Data2")] })] }),
          ]}),
        ]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buf => fs.writeFileSync("output.docx", buf));
```

## Extracting text from a .docx document

### For plain text extraction
Use `pandoc` (always use `--wrap=none` to prevent line wrapping):

```bash
pandoc input.docx -t plain --wrap=none -o output.txt
```

### For structured data extraction (e.g., to JSON)
Use python-docx directly — it gives clean access to paragraphs and table cells:

```python
import json
from docx import Document

doc = Document("input.docx")

# Read all paragraphs
for p in doc.paragraphs:
    print(repr(p.text))  # e.g. "Date: 2026-02-15", "From: Acme Corp"

# Read table data — each row is a list of cell texts
for table in doc.tables:
    for row in table.rows:
        cells = [cell.text for cell in row.cells]
        print(cells)  # e.g. ["Web Development", "40", "$150.00", "$6,000.00"]
```

**Key tips for extraction:**
- Parse `p.text` strings directly (e.g., `p.text.split(": ", 1)[1]` for "Date: 2026-02-15")
- For table data, skip the header row (`table.rows[1:]`) and access cells by index
- Convert strings like "$6,000.00" to numbers: `float(s.replace("$","").replace(",",""))`
- Convert "8%" to decimal: `int(s.replace("%","")) / 100`
- Write the result with `json.dump(data, open("output.json","w"), indent=2)`

## Key rules
- Install `docx` package locally before use: `npm install docx`
- Never use `\n` in TextRun — use separate Paragraph elements
- Use `LevelFormat.BULLET` constant for bullet lists (not unicode symbols)
- Always set `width` on TableCell with `WidthType.DXA`
- After creating a .docx, always extract its text with `pandoc file.docx -t plain --wrap=none -o output.txt` to verify all content is present
