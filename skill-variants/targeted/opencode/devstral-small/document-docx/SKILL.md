---
name: docx
description: "Create, read, and extract data from Word .docx files. Use when the user needs to: create a new .docx document, extract text or data from a .docx file, read .docx content, or convert .docx to other formats."
license: Proprietary. LICENSE.txt has complete terms
---

# DOCX Document Operations

## Task 1: Create a New .docx Document

Use the `docx` npm package (JavaScript). Install if needed: `npm install -g docx`

ALWAYS save files to the CURRENT WORKING DIRECTORY. NEVER create subdirectories.

### Complete Working Example

This example creates a document with a title heading, body text, bullet list, section headings, and a table. Copy and adapt this pattern:

```javascript
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, BorderStyle, WidthType, LevelFormat, AlignmentType } = require('docx');

const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    }]
  },
  sections: [{
    children: [
      // Title heading
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("My Title")] }),

      // Body paragraph
      new Paragraph({ children: [new TextRun("Some body text here.")] }),

      // Section heading
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Section Name")] }),

      // Bullet list items
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Item 1")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Item 2")] }),

      // Another section heading
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Another Section")] }),

      // Table with borders
      new Table({
        rows: [
          new TableRow({ children: [
            new TableCell({ width: { size: 3000, type: WidthType.DXA },
              borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } },
              children: [new Paragraph({ children: [new TextRun({ text: "Header1", bold: true })] })] }),
            new TableCell({ width: { size: 3000, type: WidthType.DXA },
              borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } },
              children: [new Paragraph({ children: [new TextRun({ text: "Header2", bold: true })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ width: { size: 3000, type: WidthType.DXA },
              borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } },
              children: [new Paragraph({ children: [new TextRun("Value1")] })] }),
            new TableCell({ width: { size: 3000, type: WidthType.DXA },
              borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } },
              children: [new Paragraph({ children: [new TextRun("Value2")] })] }),
          ]}),
        ]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("output.docx", buffer);
});
```

### CRITICAL Rules
- Use `heading: HeadingLevel.HEADING_1` (NOT `headingLevel`)
- NEVER use `\n` for line breaks — use separate Paragraph elements
- NEVER use unicode bullets like `"• Item"` — use numbering config with `LevelFormat.BULLET`
- Each TableCell MUST contain at least one Paragraph
- Save the .js file, then run with `node filename.js`

### Extract Text After Creating

After creating a .docx file, extract text using pandoc with `--wrap=none` to prevent line wrapping:
```bash
pandoc --wrap=none report.docx -t plain -o report_text.txt
```
ALWAYS use `--wrap=none` to keep text on single lines. Without it, pandoc wraps long lines which breaks multi-word phrases.

If pandoc is not available, use the bundled script:
```bash
python scripts/extract_text.py report.docx report_text.txt
```

## Task 2: Read/Extract Data from a .docx File

### Step 1: Extract raw content

Use the bundled extraction script to get all paragraphs and tables as structured JSON:
```bash
python scripts/extract_docx_to_json.py input.docx raw_data.json
```

This produces JSON with `paragraphs` (array of strings) and `tables` (array of objects with `headers` and `rows`).

### Step 2: Parse the raw data into the required format

Write a Python script that reads `raw_data.json` and transforms it into the target format. Example:

```python
import json, re

with open('raw_data.json') as f:
    raw = json.load(f)

# Process paragraphs - each is a string like "Date: 2026-02-15"
for p in raw['paragraphs']:
    if p.startswith('Date:'):
        date = p.split(':', 1)[1].strip()

# Process tables - each has headers and rows
for table in raw['tables']:
    for row in table['rows']:
        # row is a list of cell values as strings
        item_name = row[0]
        quantity = int(row[1])

# Write final JSON
with open('output.json', 'w') as f:
    json.dump(result, f, indent=2)
```

### Alternative: Use pandoc for plain text
```bash
pandoc --wrap=none input.docx -t plain -o output.txt
```
Then parse the text file with Python or other tools.

### CRITICAL Rules for Data Extraction
- Numbers in .docx often have formatting like `$1,234.00` — strip `$` and `,` before converting to float/int
- ALWAYS write numeric values as numbers (not strings) in JSON output
- Tax rates should be decimals (e.g., `0.08` not `8` or `"8%"`)
