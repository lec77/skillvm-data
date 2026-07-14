---
name: pptx
description: "Presentation creation, editing, and analysis. Use when working with .pptx files: creating presentations, reading/extracting slide content, modifying slides, or any PowerPoint task"
---

# PPTX — Create, Read, and Edit Presentations

Use **python-pptx** for all PPTX operations. Install first: `pip install python-pptx`

## 1. Creating a New Presentation

Write a Python script using python-pptx. Use layout index 0 for title slides, index 1 for title+content slides.

**Complete example — 4-slide pitch deck:**
```python
from pptx import Presentation
from pptx.util import Inches

prs = Presentation()

# Slide 1: Title slide (layout 0)
slide = prs.slides.add_slide(prs.slide_layouts[0])
slide.shapes.title.text = "Company Name"
slide.placeholders[1].text = "Subtitle Here"

# Slide 2: Content slide (layout 1)
slide = prs.slides.add_slide(prs.slide_layouts[1])
slide.shapes.title.text = "Slide Title"
tf = slide.placeholders[1].text_frame
tf.text = "First bullet point"
tf.add_paragraph().text = "Second bullet point"
tf.add_paragraph().text = "Third bullet point"

prs.save("output.pptx")
```

**Key rules:**
- Layout 0 = title slide (has title + subtitle at placeholders[0] and [1])
- Layout 1 = title + content (has title + body text at placeholders[0] and [1])
- `tf.text = "..."` sets the first paragraph; use `tf.add_paragraph().text` for additional bullets
- ALWAYS call `prs.save("filename.pptx")` at the end

## 2. Reading / Extracting Content from a PPTX

### Quick text extraction
```bash
python -m markitdown path-to-file.pptx
```
This outputs all text content as markdown. Pipe to a file: `python -m markitdown file.pptx > output.txt`

If markitdown is not available, install it: `pip install "markitdown[pptx]"`

### Structured extraction with python-pptx
Use this when you need slide-by-slide data, titles, bullets, or structured JSON output.

**Complete example — extract slides to JSON:**
```python
import json
from pptx import Presentation

prs = Presentation("input.pptx")
slides = []
for slide in prs.slides:
    title = ""
    bullets = []
    for shape in slide.shapes:
        if shape.has_text_frame:
            if shape.shape_id == slide.shapes.title.shape_id if slide.shapes.title else False:
                title = shape.text_frame.text
            else:
                for para in shape.text_frame.paragraphs:
                    if para.text.strip():
                        bullets.append(para.text.strip())
    slides.append({"title": title, "bullets": bullets})

result = {
    "title": slides[0]["title"] if slides else "",
    "subtitle": "",  # extract from first slide placeholders if needed
    "slide_count": len(slides),
    "slides": slides
}

with open("output.json", "w") as f:
    json.dump(result, f, indent=2)
```

**For subtitle extraction**, read the first slide's placeholders:
```python
first_slide = prs.slides[0]
for ph in first_slide.placeholders:
    if ph.placeholder_format.idx == 1:  # subtitle placeholder
        subtitle = ph.text
```

**For parsing numbers from text** (e.g., "$4.2M" → 4.2):
```python
import re
def parse_number(text):
    m = re.search(r'\$?([\d.]+)[MB]?', text)
    return float(m.group(1)) if m else 0

def parse_percent(text):
    m = re.search(r'(\d+)%', text)
    return int(m.group(1)) if m else 0
```

## 3. Editing an Existing Presentation

A .pptx file is a ZIP of XML files. For simple text changes, use python-pptx:
```python
from pptx import Presentation
prs = Presentation("input.pptx")
slide = prs.slides[0]  # 0-indexed
slide.shapes.title.text = "New Title"
prs.save("output.pptx")
```

For complex edits (comments, animations, layouts), unpack the ZIP and edit XML directly:
```bash
python ooxml/scripts/unpack.py input.pptx unpacked_dir/
# Edit XML files in unpacked_dir/ppt/slides/
python ooxml/scripts/pack.py unpacked_dir/ output.pptx
```

## Dependencies
- **python-pptx**: `pip install python-pptx` (create/read/edit presentations)
- **markitdown**: `pip install "markitdown[pptx]"` (quick text extraction)
