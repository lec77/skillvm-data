---
name: docx
description: "Document creation, editing, and analysis for .docx files. Creating new documents, modifying content, tracked changes, comments, text extraction."
license: Proprietary. LICENSE.txt has complete terms
---

# DOCX creation, editing, and analysis

A .docx file is a ZIP archive containing XML files. Different workflows apply depending on the task.

## Reading / Extracting Text

```bash
# ALWAYS use --wrap=none to prevent line wrapping
pandoc --wrap=none file.docx -t plain -o output.txt
pandoc --wrap=none file.docx -o output.md
# With tracked changes:
pandoc --wrap=none --track-changes=all file.docx -o output.md
```

## Creating a New Word Document (docx-js)

**CRITICAL**: Use the exact API patterns below. The `docx` npm package does NOT have `BulletList` or `ListItem` classes. Bullet lists use `numbering` config with `LevelFormat.BULLET`.

**Steps**: Write a SINGLE .js file that creates the docx AND extracts text (if needed), then run `npm install docx && node script.js` as ONE command. This minimizes tool calls and ensures all steps complete.

### Complete Working Example

```javascript
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, AlignmentType, LevelFormat, BorderStyle, WidthType,
        ShadingType, VerticalAlign } = require('docx');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

const doc = new Document({
  numbering: { config: [{
    reference: "bullets",
    levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022",
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
  }]},
  sections: [{
    children: [
      // Heading 1
      new Paragraph({ heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: "Title Here", bold: true })] }),
      // Regular paragraph
      new Paragraph({ children: [new TextRun("Body text here.")] }),
      // Heading 2
      new Paragraph({ heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: "Section", bold: true })] }),
      // Bullet list items (each is a Paragraph with numbering ref)
      new Paragraph({ numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Item 1")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Item 2")] }),
      // Table with header row and data rows
      new Table({
        columnWidths: [3120, 3120, 3120],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders, width: { size: 3120, type: WidthType.DXA },
              shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "Col1", bold: true })] })] }),
            new TableCell({ borders, width: { size: 3120, type: WidthType.DXA },
              shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "Col2", bold: true })] })] }),
            new TableCell({ borders, width: { size: 3120, type: WidthType.DXA },
              shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "Col3", bold: true })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 3120, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun("A")] })] }),
            new TableCell({ borders, width: { size: 3120, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun("B")] })] }),
            new TableCell({ borders, width: { size: 3120, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun("C")] })] }),
          ]}),
        ]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("output.docx", buf);
  console.log("Created output.docx");
  // Extract text using child_process if needed:
  require('child_process').execSync('pandoc --wrap=none output.docx -t plain -o output.txt');
  console.log("Extracted text to output.txt");
});
```

### Key Rules
- **Never use `\n`** for line breaks — use separate Paragraph elements
- **Bullet lists**: Use `numbering` config with `LevelFormat.BULLET` constant + `text: "\u2022"`. There is NO `BulletList` class.
- **Table cells**: Use `ShadingType.CLEAR` (not SOLID), set `columnWidths` on Table AND `width` on each cell
- **Always use TextRun** inside Paragraph `children` array — never use `text` property on Paragraph
- For more details, see [`docx-js.md`](docx-js.md)

### After Creating Document
If text extraction is needed, include it in the same script (see example above) or run: `pandoc --wrap=none output.docx -t plain -o output.txt`

**IMPORTANT**: Always run `npm install docx && node script.js` as a single combined command. Do NOT split into separate tool calls.

## Editing an Existing Word Document

Use the **Document library** (Python) for OOXML manipulation.

1. Read [`ooxml.md`](ooxml.md) for the Document library API and XML patterns
2. Unpack: `python ooxml/scripts/unpack.py <file.docx> <dir>`
3. Create and run a Python script using the Document library
4. Pack: `python ooxml/scripts/pack.py <dir> <output.docx>`

## Redlining Workflow (Tracked Changes)

For editing someone else's document or formal documents.

**Principle**: Only mark text that actually changes. Break replacements into [unchanged] + [deletion] + [insertion] + [unchanged].

1. `pandoc --wrap=none --track-changes=all file.docx -o current.md`
2. Identify and group changes into batches of 3-10
3. Read [`ooxml.md`](ooxml.md), unpack document
4. For each batch: grep XML, write Python script, run
5. Pack: `python ooxml/scripts/pack.py unpacked output.docx`
6. Verify: `pandoc --wrap=none --track-changes=all output.docx -o verify.md`

## Dependencies

- **pandoc**: text extraction
- **docx**: `npm install docx` (install locally)
- **defusedxml**: `pip install defusedxml`
