# docx-js Quick Reference

Generate .docx files with JavaScript. **Install first**: `npm install docx`

```javascript
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, AlignmentType, LevelFormat, BorderStyle, WidthType,
        ShadingType, VerticalAlign } = require('docx');

// Bullet list config
const numbering = { config: [{
  reference: "bullets", levels: [{
    level: 0, format: LevelFormat.BULLET, text: "\u2022",
    alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 720, hanging: 360 } } }
  }]
}]};

// Table borders helper
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

const doc = new Document({
  numbering,
  sections: [{
    properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    children: [
      // Heading
      new Paragraph({ heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: "Title", bold: true })] }),
      // Paragraph
      new Paragraph({ children: [new TextRun("Body text here.")] }),
      // Sub-heading
      new Paragraph({ heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: "Section", bold: true })] }),
      // Bullet list items
      new Paragraph({ numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Item 1")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Item 2")] }),
      // Table
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

Packer.toBuffer(doc).then(buf => fs.writeFileSync("output.docx", buf));
```

## Key Rules
- **Never use `\n`** for line breaks — use separate Paragraph elements
- **Use `LevelFormat.BULLET`** constant (not the string "bullet") for bullet lists
- **Use `ShadingType.CLEAR`** for table cell shading (SOLID causes black background)
- **Set `columnWidths`** on Table AND `width` on each TableCell
- **PageBreak** must be inside a Paragraph: `new Paragraph({ children: [new PageBreak()] })`
- **Images** require `type` parameter: `new ImageRun({ type: "png", data: buffer, transformation: {width, height} })`
- Each numbering `reference` creates an independent list (same ref = continues, different ref = restarts)

## Additional Elements
```javascript
// Numbered list - use LevelFormat.DECIMAL instead of BULLET, text: "%1."
// Images - new ImageRun({ type: "png", data: fs.readFileSync("img.png"), transformation: { width: 200, height: 150 }, altText: { title: "T", description: "D", name: "N" } })
// Page break - new Paragraph({ children: [new PageBreak()] })
// Headers/Footers - see docx npm docs
// Links - new ExternalHyperlink({ children: [new TextRun({ text: "link", style: "Hyperlink" })], link: "https://..." })
```
