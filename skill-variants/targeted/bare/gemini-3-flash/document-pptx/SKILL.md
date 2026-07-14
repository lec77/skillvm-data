---
name: pptx
description: "Create, read, and extract data from PowerPoint (.pptx) files"
license: Proprietary. LICENSE.txt has complete terms
---

# PPTX Skill

## Reading PPTX files

Extract text from a presentation:
```bash
pip install markitdown
python -m markitdown path-to-file.pptx
```

## Reading PPTX with python-pptx (structured access)

```python
from pptx import Presentation
prs = Presentation("file.pptx")
for slide in prs.slides:
    for shape in slide.shapes:
        if shape.has_text_frame:
            for para in shape.text_frame.paragraphs:
                print(para.text)
```

To get slide titles: check `shape.has_text_frame` and look for the title placeholder (`shape.shape_id == 0` or `shape.placeholder_format.idx == 0`), or simply use `slide.shapes.title.text` if available.

## Creating PPTX with python-pptx

```bash
pip install python-pptx
```

```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()

# Title slide
slide = prs.slides.add_slide(prs.slide_layouts[0])
slide.shapes.title.text = "Title Here"
slide.placeholders[1].text = "Subtitle Here"

# Content slide with bullets
slide = prs.slides.add_slide(prs.slide_layouts[1])
slide.shapes.title.text = "Slide Title"
tf = slide.placeholders[1].text_frame
tf.text = "First bullet"
tf.add_paragraph().text = "Second bullet"
tf.add_paragraph().text = "Third bullet"

prs.save("output.pptx")
```

## Extracting text to a file

After creating a PPTX, extract all text content:
```python
from pptx import Presentation
prs = Presentation("output.pptx")
lines = []
for slide in prs.slides:
    for shape in slide.shapes:
        if shape.has_text_frame:
            for para in shape.text_frame.paragraphs:
                if para.text.strip():
                    lines.append(para.text)
with open("output_text.txt", "w") as f:
    f.write("\n".join(lines))
```

## Extracting structured data to JSON

```python
import json
from pptx import Presentation

prs = Presentation("file.pptx")
slides = []
for slide in prs.slides:
    title = ""
    bullets = []
    for shape in slide.shapes:
        if shape.has_text_frame:
            for i, para in enumerate(shape.text_frame.paragraphs):
                text = para.text.strip()
                if not text:
                    continue
                if shape.shape_id == 1 or (hasattr(shape, 'placeholder_format') and shape.placeholder_format is not None and shape.placeholder_format.idx == 0):
                    title = text
                else:
                    bullets.append(text)
    slides.append({"title": title, "bullets": bullets})

data = {
    "title": slides[0]["title"] if slides else "",
    "subtitle": slides[0]["bullets"][0] if slides and slides[0]["bullets"] else "",
    "slide_count": len(slides),
    "slides": slides
}

with open("slides_data.json", "w") as f:
    json.dump(data, f, indent=2)
```
