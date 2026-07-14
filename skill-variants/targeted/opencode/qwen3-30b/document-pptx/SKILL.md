---
name: pptx
description: "Presentation creation, editing, and analysis. When Claude needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks"
---

# PPTX Creation, Editing, and Analysis

## Reading / Extracting Content

Use `markitdown` to extract text, then parse the output:

```bash
python -m markitdown file.pptx
```

Output format:
```
<!-- Slide number: 1 -->
# Slide Title
Subtitle or body text

<!-- Slide number: 2 -->
# Another Title
Bullet point 1
Bullet point 2
```

When extracting structured data (e.g., to JSON):
- The `slides` array MUST include every slide, including the title/cover slide as the first entry. For example, a 4-slide presentation must produce a `slides` array with exactly 4 objects. The title slide entry should have its title and subtitle as bullets (or empty bullets if none).
- Parse numbers from text (e.g., "$9.5M" → 9.5, "23%" → 23)

## Creating a New Presentation

Follow these steps in order:

**Step 1**: Install PptxGenJS: `npm install pptxgenjs`

**Step 2**: Write a JS script (e.g., `create.js`) using PptxGenJS:

```javascript
const PptxGenJS = require('pptxgenjs');
const pptx = new PptxGenJS();

// Title slide
let slide = pptx.addSlide();
slide.addText('Title Text', { x: 0.5, y: 1.5, w: 9, h: 1.5, fontSize: 36, bold: true, align: 'center' });
slide.addText('Subtitle Text', { x: 0.5, y: 3.0, w: 9, h: 1, fontSize: 20, align: 'center' });

// Content slide with bullets
slide = pptx.addSlide();
slide.addText('Slide Title', { x: 0.5, y: 0.3, w: 9, h: 1, fontSize: 28, bold: true });
slide.addText([
  { text: 'First bullet point', options: { bullet: true, fontSize: 18 } },
  { text: 'Second bullet point', options: { bullet: true, fontSize: 18 } },
  { text: 'Third bullet point', options: { bullet: true, fontSize: 18 } }
], { x: 0.5, y: 1.5, w: 9, h: 4 });

// writeFile is async — MUST await it or file won't be created
(async () => {
  await pptx.writeFile({ fileName: 'output.pptx' });
  console.log('Done');
})();
```

**Step 3**: Run the script: `node create.js` — this actually creates the .pptx file. Do NOT skip this step.

**Step 4**: If text extraction is needed: `python -m markitdown output.pptx > text.txt`

Key points:
- Every text element (titles, subtitles, bullets) must be added via `slide.addText()`
- Use the array form of `addText` for bullet lists
- `writeFile()` returns a Promise — always wrap code in async IIFE and await it

## Editing an Existing Presentation

Read [`ooxml.md`](ooxml.md) for the OOXML editing workflow:
1. Unpack: `python ooxml/scripts/unpack.py <file> <dir>`
2. Edit XML files in `ppt/slides/slide{N}.xml`
3. Validate: `python ooxml/scripts/validate.py <dir> --original <file>`
4. Pack: `python ooxml/scripts/pack.py <dir> <file>`

Key XML paths:
- `ppt/presentation.xml` — main metadata
- `ppt/slides/slide{N}.xml` — slide content
- `ppt/notesSlides/notesSlide{N}.xml` — speaker notes
- `ppt/theme/theme1.xml` — colors and fonts

## Template-Based Creation

For creating from a template:
1. Extract text: `python -m markitdown template.pptx`
2. Create thumbnails: `python scripts/thumbnail.py template.pptx`
3. Rearrange slides: `python scripts/rearrange.py template.pptx working.pptx 0,2,2,5`
4. Extract inventory: `python scripts/inventory.py working.pptx text-inventory.json`
5. Create replacement JSON and apply: `python scripts/replace.py working.pptx replacement.json output.pptx`

## Dependencies

- **markitdown**: `pip install "markitdown[pptx]"` (text extraction)
- **pptxgenjs**: `npm install pptxgenjs` (creation)
- **playwright**: `npm install playwright` (HTML rendering)
