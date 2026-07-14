# docx-js API Reference

Generate .docx files with JavaScript/TypeScript.

## Setup
```javascript
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, AlignmentType, LevelFormat, BorderStyle, WidthType,
        ShadingType, VerticalAlign } = require('docx');
const fs = require('fs');
```

## Create & Save
```javascript
const doc = new Document({ sections: [{ children: [/* paragraphs, tables */] }] });
Packer.toBuffer(doc).then(buf => fs.writeFileSync("output.docx", buf));
```

## Headings
```javascript
new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("Document Title")] })
new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Section")] })
new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Subsection")] })
```

## Text
```javascript
new Paragraph({ children: [
  new TextRun("Normal text"),
  new TextRun({ text: "Bold", bold: true }),
  new TextRun({ text: "Italic", italics: true }),
] })
// NEVER use \n for line breaks - use separate Paragraph elements
```

## Bullet Lists
```javascript
// Define in Document config:
const doc = new Document({
  numbering: { config: [{
    reference: "bullet-list",
    levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022",
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
  }] },
  sections: [{ children: [
    new Paragraph({ numbering: { reference: "bullet-list", level: 0 },
      children: [new TextRun("First item")] }),
    new Paragraph({ numbering: { reference: "bullet-list", level: 0 },
      children: [new TextRun("Second item")] }),
  ] }]
});
// CRITICAL: Use LevelFormat.BULLET constant, NOT string "bullet"
// NEVER use unicode bullets like "• Item" - always use numbering config
```

## Tables
```javascript
const border = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: border, bottom: border, left: border, right: border };

new Table({
  columnWidths: [3120, 3120, 3120], // 3 equal columns (9360 total for letter)
  rows: [
    // Header row
    new TableRow({ tableHeader: true, children: [
      new TableCell({ borders, width: { size: 3120, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: "Col 1", bold: true })] })] }),
      new TableCell({ borders, width: { size: 3120, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: "Col 2", bold: true })] })] }),
      new TableCell({ borders, width: { size: 3120, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: "Col 3", bold: true })] })] }),
    ]}),
    // Data row
    new TableRow({ children: [
      new TableCell({ borders, width: { size: 3120, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun("Data 1")] })] }),
      new TableCell({ borders, width: { size: 3120, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun("Data 2")] })] }),
      new TableCell({ borders, width: { size: 3120, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun("Data 3")] })] }),
    ]}),
  ]
})
```

## Key Rules
- Each TableCell needs at least 1 Paragraph child
- Set both `columnWidths` on Table AND `width` on each TableCell
- Apply borders to TableCell, not Table
- Never use `\n` for line breaks - use separate Paragraphs
- Use `LevelFormat.BULLET` constant for bullet lists
- Measurements in DXA: 1440 = 1 inch
