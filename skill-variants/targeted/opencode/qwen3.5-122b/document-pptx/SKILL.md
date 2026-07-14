---
name: pptx
description: "Create, read, and extract data from PowerPoint .pptx files using python-pptx and markitdown"
---

# PPTX: Create, Read, Extract

## Reading text from a .pptx

```bash
pip install "markitdown[pptx]" -q
python -m markitdown file.pptx
```

## Reading structured data from a .pptx

Use python-pptx to iterate slides and extract titles, bullets, and data:

```python
from pptx import Presentation
import json

prs = Presentation("file.pptx")
slides = []
for slide in prs.slides:
    title = ""
    bullets = []
    for shape in slide.shapes:
        if shape.has_text_frame:
            for para in shape.text_frame.paragraphs:
                text = para.text.strip()
                if not text:
                    continue
                if shape.shape_id == slide.shapes.title.shape_id if slide.shapes.title else False:
                    title = text
                else:
                    bullets.append(text)
    slides.append({"title": title, "bullets": bullets})

# For title slide: slides[0]["title"] is presentation title, slides[0]["bullets"][0] is subtitle
```

**Install**: `pip install python-pptx -q`

## Creating a new .pptx

Use python-pptx to create presentations programmatically:

```python
from pptx import Presentation
from pptx.util import Inches, Pt

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
tf.add_paragraph().text = "Third bullet"

prs.save("output.pptx")
```

**Slide layouts**: `[0]` = Title, `[1]` = Title + Content, `[5]` = Blank

**After creating**: Extract text to verify content:
```bash
python -m markitdown output.pptx > output_text.txt
```
