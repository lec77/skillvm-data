---
name: pptx
description: Create, read, and extract data from PowerPoint (.pptx) files using python-pptx
---

# PowerPoint (.pptx) Skill

Use `python-pptx` for all PPTX operations. Install first: `pip install python-pptx`

**IMPORTANT: Always write Python code to a .py file first, then run it with `python3 file.py`. Never use `python3 -c "..."` because shell variable expansion corrupts `$` signs in strings.**

## Creating Presentations

Write this to a .py file and execute it:

```python
from pptx import Presentation

prs = Presentation()

# Title slide (layout 0 = title + subtitle)
slide = prs.slides.add_slide(prs.slide_layouts[0])
slide.shapes.title.text = "Title Here"
slide.placeholders[1].text = "Subtitle Here"

# Content slide with bullets (layout 1 = title + bullet body)
slide = prs.slides.add_slide(prs.slide_layouts[1])
slide.shapes.title.text = "Slide Title"
tf = slide.placeholders[1].text_frame
tf.text = "First bullet"
tf.add_paragraph().text = "Second bullet"
tf.add_paragraph().text = "Third bullet"

prs.save("output.pptx")
```

## Extracting Text from PPTX

```python
from pptx import Presentation

prs = Presentation("input.pptx")
lines = []
for i, slide in enumerate(prs.slides, 1):
    lines.append(f"--- Slide {i} ---")
    for shape in slide.shapes:
        if shape.has_text_frame:
            for para in shape.text_frame.paragraphs:
                text = para.text.strip()
                if text:
                    lines.append(text)
    lines.append("")

with open("output.txt", "w") as f:
    f.write("\n".join(lines))
```

## Extracting Structured Data to JSON

Extract slide titles and bullets separately. The title shape must NOT appear in bullets.

```python
import json, re
from pptx import Presentation

prs = Presentation("input.pptx")

# Extract slides with title/bullets separation
slides = []
for slide in prs.slides:
    title_shape = slide.shapes.title
    title = title_shape.text.strip() if title_shape else ""
    bullets = []
    for shape in slide.shapes:
        if not shape.has_text_frame:
            continue
        if title_shape and shape.shape_id == title_shape.shape_id:
            continue  # skip title shape entirely
        for para in shape.text_frame.paragraphs:
            t = para.text.strip()
            if t:
                bullets.append(t)
    slides.append({"title": title, "bullets": bullets})

# Build base structure
data = {
    "title": slides[0]["title"] if slides else "",
    "subtitle": slides[0]["bullets"][0] if slides and slides[0]["bullets"] else "",
    "slide_count": len(slides),
    "slides": slides
}

# Parse numeric fields from bullet text
# Collect all bullet text across all slides
all_bullets = []
for s in slides:
    all_bullets.extend(s["bullets"])

# Extract total_revenue: find bullet containing "Total Revenue" and parse the number
for b in all_bullets:
    if "total revenue" in b.lower():
        m = re.search(r'[\$]?([\d.]+)\s*M', b)
        if m:
            data["total_revenue"] = float(m.group(1))
        break

# Extract yoy_growth: find bullet containing "YoY" and parse percentage
for b in all_bullets:
    if "yoy" in b.lower():
        m = re.search(r'([\d.]+)\s*%', b)
        if m:
            data["yoy_growth"] = float(m.group(1))
            if data["yoy_growth"] == int(data["yoy_growth"]):
                data["yoy_growth"] = int(data["yoy_growth"])
        break

# Extract regions: find the "Revenue" slide and parse "Region: $X.XM" bullets
regions = []
for s in slides:
    if "revenue" in s["title"].lower():
        for b in s["bullets"]:
            m = re.search(r'^(.+?):\s*[\$]?([\d.]+)\s*M', b)
            if m:
                regions.append({"name": m.group(1).strip(), "revenue": float(m.group(2))})
        break
data["regions"] = regions

with open("slides_data.json", "w") as f:
    json.dump(data, f, indent=2)
```

## Tips
- Always `pip install python-pptx` before importing
- Always write code to .py files, never inline with `python3 -c`
- Title slide subtitle is in `placeholders[1]`
- Content slides use `placeholders[1].text_frame` for bullet text
- Use `slide.shapes.title` to identify title shape (may be None)
- For regex with dollar signs, use `[\$]?` to optionally match literal `$`
