# docx npm package — Quick Reference

## Setup & Save
```javascript
const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, AlignmentType, LevelFormat, WidthType, BorderStyle,
        ShadingType } = require("docx");

const doc = new Document({ sections: [{ children: [/* paragraphs, tables */] }] });
Packer.toBuffer(doc).then(buf => fs.writeFileSync("out.docx", buf));
```

## Paragraphs & Headings
```javascript
// Heading levels: TITLE, HEADING_1, HEADING_2, HEADING_3, etc.
new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Heading")] })
new Paragraph({ children: [new TextRun("Normal text")] })
new Paragraph({ children: [new TextRun({ text: "Bold", bold: true })] })
```

IMPORTANT: Never use `\n` inside TextRun. Use separate Paragraph elements for each line.

## Bullet Lists
```javascript
// 1. Define numbering config in Document constructor
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    }]
  },
  sections: [{ children: [
    new Paragraph({ numbering: { reference: "bullets", level: 0 },
      children: [new TextRun("Bullet item 1")] }),
    new Paragraph({ numbering: { reference: "bullets", level: 0 },
      children: [new TextRun("Bullet item 2")] }),
  ]}]
});
```

CRITICAL: Use `LevelFormat.BULLET` constant, never unicode bullet characters directly.

## Tables
```javascript
const border = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: border, bottom: border, left: border, right: border };

new Table({
  rows: [
    // Header row
    new TableRow({ children: [
      new TableCell({ borders, width: { size: 3000, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: "Header", bold: true })] })] }),
      new TableCell({ borders, width: { size: 3000, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: "Header2", bold: true })] })] }),
    ]}),
    // Data row
    new TableRow({ children: [
      new TableCell({ borders, width: { size: 3000, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun("Value1")] })] }),
      new TableCell({ borders, width: { size: 3000, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun("Value2")] })] }),
    ]}),
  ]
})
```

Each TableCell MUST have `borders` and `width` with `WidthType.DXA`. Each cell's children must be Paragraph elements.
