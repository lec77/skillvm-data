---
name: pptx
description: "Create, read, and edit PowerPoint (.pptx) files using python-pptx"
license: Proprietary. LICENSE.txt has complete terms
---

# PPTX Skill

## Setup (REQUIRED before any python-pptx work)

FIRST check if `.venv` already exists. If it does, skip venv creation and just use it:
```bash
# Only run these if .venv does NOT exist:
python3 -m venv .venv
.venv/bin/pip install python-pptx -q
```

Always run scripts with `.venv/bin/python script.py`.

IMPORTANT: After running a script, ALWAYS read the output file to verify it contains the correct data from the actual input file. Do NOT assume what the output will be.

## Creating presentations

Write a Python script, then run it with `.venv/bin/python script.py`:

```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()

# Title slide (layout 0) — has title + subtitle placeholders
slide = prs.slides.add_slide(prs.slide_layouts[0])
slide.shapes.title.text = "Title Here"
slide.placeholders[1].text = "Subtitle Here"

# Content slide with bullets (layout 1) — has title + body
slide = prs.slides.add_slide(prs.slide_layouts[1])
slide.shapes.title.text = "Slide Title"
tf = slide.placeholders[1].text_frame
tf.text = "First bullet"
tf.add_paragraph().text = "Second bullet"
tf.add_paragraph().text = "Third bullet"

prs.save("output.pptx")
```

## Extracting text to a file

Quick dump all text using python-pptx:
```python
from pptx import Presentation

prs = Presentation("input.pptx")
with open("output.txt", "w") as f:
    for slide in prs.slides:
        for shape in slide.shapes:
            if shape.has_text_frame:
                f.write(shape.text_frame.text + "\n")
```

## Extracting structured data to JSON

```python
from pptx import Presentation
import json, re

prs = Presentation("input.pptx")
result = {"slide_count": len(prs.slides), "slides": []}

for slide in prs.slides:
    title = ""
    bullets = []
    for shape in slide.shapes:
        if not shape.has_text_frame:
            continue
        if slide.shapes.title and shape.shape_id == slide.shapes.title.shape_id:
            title = shape.text_frame.text
        else:
            for para in shape.text_frame.paragraphs:
                text = para.text.strip()
                if text:
                    bullets.append(text)
    result["slides"].append({"title": title, "bullets": bullets})

# Title and subtitle from slide 1
result["title"] = result["slides"][0]["title"] if result["slides"] else ""
slide0 = prs.slides[0]
for ph in slide0.placeholders:
    if ph.placeholder_format.idx == 1:
        result["subtitle"] = ph.text

with open("output.json", "w") as f:
    json.dump(result, f, indent=2)
```

## Parsing numbers from text

```python
import re

def parse_money(text):
    """'$4.2M' → 4.2, '$9.5M' → 9.5"""
    m = re.search(r'\$?([\d.]+)\s*[MmBb]?', text)
    return float(m.group(1)) if m else 0

def parse_pct(text):
    """'23%' → 23"""
    m = re.search(r'([\d.]+)\s*%', text)
    return int(float(m.group(1))) if m else 0

# "North America: $4.2M" → name="North America", revenue=4.2
# "YoY Growth: 23%" → 23
# "Total Revenue: $9.5M" → 9.5
```

## Editing existing presentations

```python
prs = Presentation("existing.pptx")
slide = prs.slides[0]
slide.shapes.title.text = "New Title"
prs.save("modified.pptx")
```

## Quick reference
- Layout 0 = title slide (title + subtitle in placeholders 0 and 1)
- Layout 1 = content slide (title + body with bullets)
- Title: `slide.shapes.title.text`
- Body: `slide.placeholders[1].text_frame`
- Add bullet: `text_frame.add_paragraph().text = "text"`
- Subtitle placeholder index = 1 on title slides
