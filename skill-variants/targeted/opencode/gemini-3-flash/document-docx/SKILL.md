---
name: docx
description: "Create, read, and extract data from Word documents (.docx). Use when Claude needs to: create new .docx files with headings/lists/tables, extract text or structured data from existing .docx files, or convert documents between formats. Trigger on any mention of Word documents, .docx files, or document generation tasks."
---

# DOCX Skill

## Critical Rules

1. **ALWAYS save to the EXACT filename the user requested.** If they say "create report.docx", save to `report.docx` — never `report_final.docx`.
2. **Write code to a file, then run it.** For creation: write a `.js` file, run with `node`. For extraction: write a `.py` file, run with `python3`. NEVER use inline one-liners for multi-line code.
3. **Use the `docx` npm package** to CREATE new documents. It is already installed globally — do NOT run `npm install docx`.
4. **Use `pandoc`** to READ/extract text from existing documents. ALWAYS use `--wrap=none` to prevent line wrapping. Always **read the converted output first** before writing any extraction code.
5. **NEVER use `\n` for line breaks** — use separate `Paragraph` elements.
6. **NEVER use unicode bullet symbols** (`"• Item"`) — use proper `LevelFormat.BULLET` numbering config.

## Reading / Extracting from a DOCX

**Step 1: Convert to markdown** to see the document's content with structure preserved:

```bash
pandoc file.docx --wrap=none -o output.md
```

**Step 2: Read the markdown** to understand the document structure, headings, tables, and data.

**Step 3: Extract data.** For structured extraction (JSON), either:
- Write the JSON directly based on what you read (simplest — works for most cases), or
- Use `python-docx` for programmatic access to paragraphs and tables:

```python
# extract_data.py
from docx import Document
import json, re

doc = Document("input.docx")

# Read all paragraphs
for p in doc.paragraphs:
    print(repr(p.text))  # See exact text content

# Read tables — each table has rows, each row has cells
for table in doc.tables:
    for row in table.rows:
        print([cell.text for cell in row.cells])

# Parse currency strings to numbers
def parse_currency(s):
    return float(re.sub(r'[$,]', '', s))
```

**The key insight: always read first, then write the output.** Convert the docx to markdown, read it, understand the layout — then write the JSON (or CSV, etc.) based on what you see. Do NOT write regex parsers blindly.

**Extracting plain text:**
```bash
pandoc file.docx -t plain --wrap=none -o output.txt
```

## Creating a DOCX — Workflow

1. Write a `.js` file using the `docx` library
2. Run with `node create_doc.js`
3. Verify: `ls -la output.docx`

## Worked Example

**Task:** Create a report with a title, paragraph, bullet list, and table.

```javascript
// create_report.js
const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, LevelFormat, AlignmentType, BorderStyle, WidthType,
        ShadingType } = require("docx");

const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const cellBorders = { top: border, bottom: border, left: border, right: border };

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
      // Title
      new Paragraph({ heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Project Status Report")] }),
      // Body paragraph
      new Paragraph({ spacing: { after: 200 },
        children: [new TextRun("Report for the Engineering department.")] }),
      // Section heading
      new Paragraph({ heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Team Members")] }),
      // Bullet list
      ...(["Alice (Lead)", "Bob (Dev)", "Carol (QA)"]).map(name =>
        new Paragraph({ numbering: { reference: "bullets", level: 0 },
          children: [new TextRun(name)] })),
      // Section heading
      new Paragraph({ heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Milestones")] }),
      // Table
      new Table({
        columnWidths: [3120, 3120, 3120],
        rows: [
          // Header row
          new TableRow({ children: ["Milestone", "Status", "Date"].map(h =>
            new TableCell({ borders: cellBorders,
              width: { size: 3120, type: WidthType.DXA },
              shading: { fill: "D9E2F3", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })]
            })) }),
          // Data rows
          ...[["Design", "Done", "2026-01-15"], ["Backend", "Done", "2026-02-10"]].map(row =>
            new TableRow({ children: row.map(val =>
              new TableCell({ borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun(val)] })]
              })) })),
        ]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buf => fs.writeFileSync("report.docx", buf));
```

## Key Patterns

| Task | Code |
|------|------|
| Heading | `heading: HeadingLevel.HEADING_1` |
| Bold text | `new TextRun({ text: "...", bold: true })` |
| Bullet list | numbering config with `LevelFormat.BULLET` (see example) |
| Numbered list | numbering config with `LevelFormat.DECIMAL`, `text: "%1."` |
| Table cell | `new TableCell({ borders, width: { size, type: WidthType.DXA }, children: [...] })` |
| Cell shading | `shading: { fill: "D9E2F3", type: ShadingType.CLEAR }` |
| Page break | `new Paragraph({ children: [new PageBreak()] })` |
| Save file | `Packer.toBuffer(doc).then(buf => fs.writeFileSync("file.docx", buf))` |
| Read DOCX text | `pandoc file.docx -t plain --wrap=none -o output.txt` |
| Read DOCX as md | `pandoc file.docx --wrap=none -o output.md` |

## Bullet List Boilerplate

Every bullet list needs a numbering config in the Document constructor:

```javascript
numbering: {
  config: [{
    reference: "my-bullets",  // unique name per list
    levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022",
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
  }]
}
// Then each item:
new Paragraph({ numbering: { reference: "my-bullets", level: 0 },
  children: [new TextRun("Item text")] })
```

## Table Boilerplate

Tables need BOTH `columnWidths` on the Table AND `width` on each cell:

```javascript
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const cellBorders = { top: border, bottom: border, left: border, right: border };

new Table({
  columnWidths: [4680, 4680],  // DXA units, 1440 = 1 inch
  rows: [new TableRow({ children: [
    new TableCell({
      borders: cellBorders,
      width: { size: 4680, type: WidthType.DXA },
      children: [new Paragraph({ children: [new TextRun("Cell")] })]
    })
  ]})]
})
```

## Common Mistakes to Avoid

- **Wrong filename**: ALWAYS use the exact name the user asked for
- **Unicode bullets**: `"• Item"` or `SymbolRun` — use numbering config with `LevelFormat.BULLET` instead
- **`\n` for line breaks**: Creates corrupted output — use separate Paragraph elements
- **PageBreak outside Paragraph**: Creates invalid XML — always wrap in `new Paragraph({ children: [new PageBreak()] })`
- **Missing table columnWidths**: Tables render incorrectly — set both `columnWidths` array AND per-cell `width`
- **ShadingType.SOLID**: Causes black backgrounds — ALWAYS use `ShadingType.CLEAR`
- **String "bullet"**: Must use the constant `LevelFormat.BULLET`, not the string `"bullet"`
- **Inline python/node**: NEVER run multi-line code with `-c` or `-e` flags — write a file first
- **Missing --wrap=none**: pandoc wraps text by default, breaking long lines — ALWAYS use `--wrap=none`
