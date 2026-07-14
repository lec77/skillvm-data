---
name: pptx
description: "Presentation creation, editing, and analysis. When Claude needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks"
---

# PPTX Creation, Editing, and Analysis

## Decision: Which method to use?

| Task | Method |
|------|--------|
| Create new presentation (text, bullets, titles) | **python-pptx** (Python) |
| Create presentation with charts/complex layouts | **html2pptx** workflow (read `html2pptx.md` first) |
| Read/extract text from existing .pptx | **markitdown** or **python-pptx** |
| Edit existing .pptx (modify slides) | **OOXML** workflow (read `ooxml.md` first) |

## Creating a new presentation with python-pptx

**ALWAYS use python-pptx for text-based presentations.** It is simpler and more reliable than html2pptx.

### Step 1: Install python-pptx
```bash
pip install python-pptx
```

### Step 2: Write a Python script to create the presentation

Use this exact pattern. The script creates slides using built-in layouts.

```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()

# Slide 1: Title slide (layout index 0)
slide = prs.slides.add_slide(prs.slide_layouts[0])
slide.shapes.title.text = "My Title"
slide.placeholders[1].text = "My Subtitle"

# Slide 2: Title + Content slide (layout index 1)
slide = prs.slides.add_slide(prs.slide_layouts[1])
slide.shapes.title.text = "Section Title"
tf = slide.placeholders[1].text_frame
tf.text = "First bullet point"
tf.add_paragraph().text = "Second bullet point"
tf.add_paragraph().text = "Third bullet point"

prs.save("output.pptx")
```

**Layout indices:**
- `0` = Title Slide (has title + subtitle)
- `1` = Title and Content (has title + body with bullets)
- `5` = Blank slide

**IMPORTANT rules:**
- `tf.text = "..."` sets the FIRST paragraph. Use `tf.add_paragraph().text = "..."` for additional lines.
- NEVER manually add bullet characters (•, -, *) — python-pptx adds them automatically for content placeholders.
- `slide.shapes.title.text` sets the title. `slide.placeholders[1].text_frame` is the body area.

### Step 3: Extract text after creation
```bash
python -m markitdown output.pptx > output_text.txt
```
This converts the presentation to readable text. ALWAYS verify markitdown is installed: `pip install "markitdown[pptx]"`.

### Complete example: 4-slide pitch deck

```python
from pptx import Presentation

prs = Presentation()

# Title slide
s = prs.slides.add_slide(prs.slide_layouts[0])
s.shapes.title.text = "Company Name"
s.placeholders[1].text = "Tagline Here"

# Problem slide
s = prs.slides.add_slide(prs.slide_layouts[1])
s.shapes.title.text = "The Problem"
tf = s.placeholders[1].text_frame
tf.text = "First problem point"
tf.add_paragraph().text = "Second problem point"
tf.add_paragraph().text = "Third problem point"

# Solution slide
s = prs.slides.add_slide(prs.slide_layouts[1])
s.shapes.title.text = "Our Solution"
tf = s.placeholders[1].text_frame
tf.text = "Solution point 1"
tf.add_paragraph().text = "Solution point 2"

# Team slide
s = prs.slides.add_slide(prs.slide_layouts[1])
s.shapes.title.text = "Our Team"
tf = s.placeholders[1].text_frame
tf.text = "Person 1 - Role"
tf.add_paragraph().text = "Person 2 - Role"

prs.save("pitch.pptx")
```

## Reading and extracting content from .pptx

### Method 1: markitdown (quick text extraction)
```bash
python -m markitdown file.pptx
```
Returns all text content as markdown. Good for getting an overview.

### Method 2: python-pptx (structured extraction)
Use when you need structured data (slide titles, bullet lists, counts, specific values).

```python
from pptx import Presentation
import json

prs = Presentation("input.pptx")
result = {
    "title": "",
    "subtitle": "",
    "slide_count": len(prs.slides),
    "slides": []
}

for i, slide in enumerate(prs.slides):
    slide_data = {"title": "", "bullets": []}
    for shape in slide.shapes:
        if shape.has_text_frame:
            tf = shape.text_frame
            # First shape with text on slide 0 is usually title
            if hasattr(shape, "placeholder_format") and shape.placeholder_format is not None:
                ph_idx = shape.placeholder_format.idx
                if ph_idx == 0:  # Title placeholder
                    slide_data["title"] = tf.text
                elif ph_idx == 1 and i == 0:  # Subtitle on title slide
                    result["subtitle"] = tf.text
                elif ph_idx == 1:  # Body placeholder
                    for para in tf.paragraphs:
                        if para.text.strip():
                            slide_data["bullets"].append(para.text.strip())
    result["slides"].append(slide_data)

# Set top-level title from first slide
if result["slides"]:
    result["title"] = result["slides"][0]["title"]

with open("output.json", "w") as f:
    json.dump(result, f, indent=2)
```

**Key patterns for extraction:**
- `shape.placeholder_format.idx == 0` → title placeholder
- `shape.placeholder_format.idx == 1` → subtitle (slide 0) or body (other slides)
- Iterate `tf.paragraphs` to get individual bullet points
- Use `para.text.strip()` to clean whitespace
- Parse numbers from text: e.g., `"$9.5M"` → extract `9.5` with regex or string ops

## Editing an existing presentation (OOXML)

For modifying existing .pptx files, use the OOXML workflow:
1. Read [`ooxml.md`](ooxml.md) completely first
2. Unpack: `python ooxml/scripts/unpack.py <file.pptx> <output_dir>`
3. Edit XML files in `ppt/slides/`
4. Validate: `python ooxml/scripts/validate.py <dir> --original <file.pptx>`
5. Pack: `python ooxml/scripts/pack.py <dir> <output.pptx>`

## Creating presentations with html2pptx (advanced)

For presentations needing charts, complex layouts, or custom visual design:
1. Read [`html2pptx.md`](html2pptx.md) completely first
2. Create HTML files for each slide (720pt × 405pt for 16:9)
3. Run JavaScript using `html2pptx.js` library to convert to PPTX
4. Validate with thumbnails: `python scripts/thumbnail.py output.pptx`

**ONLY use html2pptx when you need charts or complex visual layouts.** For text-only presentations, ALWAYS use python-pptx.
