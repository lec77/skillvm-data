---
name: pptx
description: "Presentation creation, editing, and analysis. When Claude needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks"
---

# PPTX Creation, Editing, and Analysis

## Reading / Extracting Content

Use `markitdown` to extract text:

```bash
python -m markitdown file.pptx
```

Output format — each slide starts with `<!-- Slide number: N -->`:
```
<!-- Slide number: 1 -->
# Slide Title
Subtitle or body text

<!-- Slide number: 2 -->
# Another Title
- Bullet point 1
- Bullet point 2
```

When extracting structured data to JSON:
- The `slides` array MUST include ALL slides (including the title slide as index 0)
- Parse numbers from text: "$9.5M" → 9.5, "23%" → 23

## Creating a New Presentation

Use `python-pptx` (already installed). Write a Python script and run it.

**CRITICAL**: Use `from pptx.util import Inches, Pt` and `from pptx.util import Emu`. Colors use `RGBColor` (capital RGB), NOT `RgbColor`.

```python
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

prs = Presentation()

# Title slide — use layout 0 (Title Slide) which has title + subtitle placeholders
slide = prs.slides.add_slide(prs.slide_layouts[0])
slide.shapes.title.text = "Presentation Title"
slide.placeholders[1].text = "Subtitle Text"

# Content slide — use layout 1 (Title and Content) which has title + body placeholders
slide = prs.slides.add_slide(prs.slide_layouts[1])
slide.shapes.title.text = "Slide Title"
tf = slide.placeholders[1].text_frame
tf.text = "First bullet point"
tf.add_paragraph().text = "Second bullet point"
tf.add_paragraph().text = "Third bullet point"

prs.save("output.pptx")
```

**Key points**:
- Layout 0 = Title Slide (title + subtitle). Access subtitle via `slide.placeholders[1]`
- Layout 1 = Title and Content (title + bullet body). Access body via `slide.placeholders[1].text_frame`
- Add bullets with `tf.add_paragraph().text = "..."`
- Colors: `from pptx.dml.color import RGBColor` then `RGBColor(0xFF, 0x00, 0x00)`
- Save is synchronous — just call `prs.save("file.pptx")`

**After creating**, extract text if needed:
```bash
python -m markitdown output.pptx > text.txt
```

## Editing an Existing Presentation

Read [`ooxml.md`](ooxml.md) for the OOXML editing workflow:
1. Unpack: `python ooxml/scripts/unpack.py <file> <dir>`
2. Edit XML files in `ppt/slides/slide{N}.xml`
3. Validate: `python ooxml/scripts/validate.py <dir> --original <file>`
4. Pack: `python ooxml/scripts/pack.py <dir> <file>`

## Template-Based Creation

1. Extract text: `python -m markitdown template.pptx`
2. Create thumbnails: `python scripts/thumbnail.py template.pptx`
3. Rearrange slides: `python scripts/rearrange.py template.pptx working.pptx 0,2,2,5`
4. Extract inventory: `python scripts/inventory.py working.pptx text-inventory.json`
5. Create replacement JSON and apply: `python scripts/replace.py working.pptx replacement.json output.pptx`

## Dependencies

- **python-pptx**: `pip install python-pptx` (creation and editing)
- **markitdown**: `pip install "markitdown[pptx]"` (text extraction)
