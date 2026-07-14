---
name: pptx
description: "Presentation creation, editing, and analysis. When Claude needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks"
license: Proprietary. LICENSE.txt has complete terms
---

# PPTX Creation, Editing, and Analysis

## Workflow Selection

| Task | Approach | Key tool |
|------|----------|----------|
| Read text content | `python -m markitdown file.pptx` | markitdown |
| Read raw XML (notes, comments, layouts) | Unpack: `python ooxml/scripts/unpack.py file.pptx out/` | ooxml scripts |
| Create simple (text/bullets only) | python-pptx directly | python-pptx |
| Create styled (charts, custom design) | html2pptx workflow | html2pptx.js + PptxGenJS |
| Edit existing | Unpack → edit XML → validate → pack | ooxml scripts |
| Create from template | Rearrange → inventory → replace | scripts/*.py |

**Choose the simplest approach that works.** For presentations with only text, titles, and bullet points, python-pptx is faster and more reliable. Use html2pptx only when you need custom visual styling, charts, or complex layouts.

## Reading Content

**Text extraction**: `python -m markitdown path-to-file.pptx`

**Raw XML access** (needed for comments, notes, layouts, animations):
1. Unpack: `python ooxml/scripts/unpack.py <file> <output_dir>`
2. Key paths: `ppt/slides/slide{N}.xml`, `ppt/notesSlides/notesSlide{N}.xml`, `ppt/comments/`, `ppt/theme/theme1.xml`
3. Typography/colors: check `<a:clrScheme>` and `<a:fontScheme>` in theme, `<a:rPr>` in slides

## Creating Simple Presentations (python-pptx)

For text-only presentations (titles, bullets, basic content), use python-pptx directly:

```python
from pptx import Presentation
from pptx.util import Inches

prs = Presentation()
# Title slide
slide = prs.slides.add_slide(prs.slide_layouts[0])
slide.shapes.title.text = "Title"
slide.placeholders[1].text = "Subtitle"

# Content slide with bullets
slide = prs.slides.add_slide(prs.slide_layouts[1])
slide.shapes.title.text = "Slide Title"
tf = slide.placeholders[1].text_frame
tf.text = "First bullet"
tf.add_paragraph().text = "Second bullet"

prs.save("output.pptx")
```

Install if needed: `pip install python-pptx`

**Text extraction** from existing .pptx: `python -m markitdown file.pptx` or iterate slides with python-pptx.

## Creating Styled Presentations (html2pptx)

For presentations needing custom visual design, charts, or complex layouts, use the **html2pptx** workflow: HTML → PptxGenJS → .pptx

### Design First
Before writing code, consider the subject matter and choose colors that match the content. Use web-safe fonts only (Arial, Helvetica, Times New Roman, Georgia, Courier New, Verdana, Tahoma, Trebuchet MS, Impact).

**Sample palettes** (pick one, adapt, or create your own):
1. Navy/slate: #1C2833, #2E4053, #AAB7B8, #F4F6F6
2. Teal/coral: #5EA8A7, #277884, #FE4447, #FFFFFF
3. Burgundy/gold: #5D1D2E, #951233, #C15937, #997929
4. Sage/terracotta: #87A96B, #E07A5F, #F4F1DE, #2C2C2C
5. Charcoal/red: #292929, #E33737, #CCCBCB, #F2F2F2

### Workflow
1. **Read [`html2pptx.md`](html2pptx.md) completely** before proceeding
2. Create HTML files per slide (720pt x 405pt for 16:9). All text MUST be in `<p>`, `<h1>`-`<h6>`, `<ul>`, `<ol>` — text in bare `<div>` or `<span>` is silently dropped
3. Rasterize gradients and icons as PNG via Sharp FIRST — CSS gradients don't convert
4. Run html2pptx.js to convert HTML → PPTX, add charts/tables via PptxGenJS API
5. **Validate visually**: `python scripts/thumbnail.py output.pptx workspace/thumbnails --cols 4`, inspect for text cutoff/overlap/contrast issues, fix and regenerate if needed

**Layout tips**: For slides with charts/tables, use two-column layout (header spanning full width, then text + chart side by side) or full-slide layout. Never vertically stack text above charts.

## Editing Existing Presentations

1. **Read [`ooxml.md`](ooxml.md) completely** before proceeding
2. Unpack: `python ooxml/scripts/unpack.py <file> <output_dir>`
3. Edit XML files (mainly `ppt/slides/slide{N}.xml`)
4. Validate after each edit: `python ooxml/scripts/validate.py <dir> --original <file>`
5. Pack: `python ooxml/scripts/pack.py <dir> <output_file>`

## Creating from Template

1. Extract text + thumbnails:
   - `python -m markitdown template.pptx > template-content.md`
   - `python scripts/thumbnail.py template.pptx`
2. Analyze and save template inventory to `template-inventory.md` (list every slide with index, layout type, purpose; slides are 0-indexed)
3. Create outline mapping content to template slides. Match layout structure to content (2-column only for 2 items, 3-column only for 3 items, etc.)
4. Rearrange: `python scripts/rearrange.py template.pptx working.pptx 0,34,34,50,52`
5. Extract inventory: `python scripts/inventory.py working.pptx text-inventory.json`
6. Create `replacement-text.json` with paragraphs for each shape. Unlisted shapes are auto-cleared. Include formatting properties (bold, bullet, alignment). Bullets: set `"bullet": true, "level": 0` — don't include bullet symbols in text.
7. Apply: `python scripts/replace.py working.pptx replacement-text.json output.pptx`

## Thumbnail Grids

```bash
python scripts/thumbnail.py presentation.pptx [output_prefix] [--cols 4]
```
Creates `thumbnails.jpg` (or numbered files for large decks). Slides are 0-indexed. Columns: 3-6 (affects grid size).

## Code Style
Write concise code. Avoid verbose variable names, redundant operations, and unnecessary print statements.

## Dependencies
- markitdown: `pip install "markitdown[pptx]"`
- pptxgenjs, playwright, sharp: npm (globally installed)
- react-icons: npm (for icons)
- LibreOffice: for PDF conversion
- Poppler: for pdftoppm
- defusedxml: `pip install defusedxml`
