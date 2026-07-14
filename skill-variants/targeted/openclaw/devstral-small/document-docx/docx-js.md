# docx-js Quick Reference

Create .docx files with JavaScript using the `docx` npm package.

## Complete Working Example

This example creates a document with a title, paragraph, bullet list, and table:

```javascript
const docx = require("docx");
const fs = require("fs");

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, AlignmentType, LevelFormat, WidthType, ShadingType, BorderStyle } = docx;

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
      // Title heading
      new Paragraph({ heading: HeadingLevel.HEADING_1,
        children: [new TextRun("My Title")] }),

      // Normal paragraph
      new Paragraph({ children: [new TextRun("Some body text here.")] }),

      // Section heading
      new Paragraph({ heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Section Name")] }),

      // Bullet list items
      new Paragraph({ numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("First item")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Second item")] }),

      // Table
      new Table({
        columnWidths: [3120, 3120, 3120],
        rows: [
          // Header row
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA },
              shading: { fill: "DDDDDD", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "Col 1", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA },
              shading: { fill: "DDDDDD", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "Col 2", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA },
              shading: { fill: "DDDDDD", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "Col 3", bold: true })] })] }),
          ]}),
          // Data row
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun("Value 1")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun("Value 2")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun("Value 3")] })] }),
          ]}),
        ]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => fs.writeFileSync("output.docx", buf));
```

## Key Rules

1. **Never use `\n`** - use separate Paragraph elements for each line
2. **Bullets must use numbering config** with `LevelFormat.BULLET` - never use unicode symbols like "•" as text
3. **Table cells need ShadingType.CLEAR** (never SOLID - causes black background)
4. **Set column widths twice**: `columnWidths` on Table AND `width` on each TableCell
5. **Each TableCell must contain at least one Paragraph**
6. **PageBreak must be inside a Paragraph**: `new Paragraph({ children: [new PageBreak()] })`
7. **HeadingLevel.HEADING_1** = main title, **HeadingLevel.HEADING_2** = section heading

## Text Extraction After Creating DOCX

```bash
pandoc -f docx -t plain output.docx -o output_text.txt
```
