---
name: pptx
description: "Presentation creation, editing, and analysis. When working with .pptx files for creating, modifying, or extracting content from presentations"
license: Proprietary. LICENSE.txt has complete terms
---

# PPTX creation, editing, and analysis

A .pptx file is a ZIP archive containing XML files. You can create, read, and edit presentations.

## Creating presentations — USE python-pptx

**ALWAYS use python-pptx to create presentations.** Do NOT use html2pptx or PptxGenJS — they require Playwright/Chrome which may not be available.

### Quick setup
```bash
pip install python-pptx 2>/dev/null || pip3 install python-pptx
```

### Create a presentation with python-pptx
```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()

# Title slide (layout 0)
slide = prs.slides.add_slide(prs.slide_layouts[0])
slide.shapes.title.text = "Title Here"
slide.placeholders[1].text = "Subtitle Here"

# Content slide with bullets (layout 1)
slide = prs.slides.add_slide(prs.slide_layouts[1])
slide.shapes.title.text = "Slide Title"
tf = slide.placeholders[1].text_frame
tf.text = "First bullet point"
tf.add_paragraph().text = "Second bullet point"
tf.add_paragraph().text = "Third bullet point"

prs.save("output.pptx")
```

Key layouts: 0 = Title Slide, 1 = Title and Content, 5 = Blank

## Reading and extracting content

### Text extraction with markitdown
```bash
python -m markitdown path-to-file.pptx
```
This converts the presentation to markdown text. Use this when you need to read text content.

### Text extraction with python-pptx
```python
from pptx import Presentation

prs = Presentation("input.pptx")
for i, slide in enumerate(prs.slides):
    for shape in slide.shapes:
        if shape.has_text_frame:
            for para in shape.text_frame.paragraphs:
                print(para.text)
```

### Extracting structured data
When extracting data to JSON, read the PPTX with python-pptx and parse the text:
```python
import json
from pptx import Presentation

prs = Presentation("input.pptx")
data = {"slides": []}
for slide in prs.slides:
    slide_data = {"title": "", "bullets": []}
    for shape in slide.shapes:
        if shape.has_text_frame:
            if shape.shape_id == slide.shapes.title.shape_id if slide.shapes.title else False:
                slide_data["title"] = shape.text_frame.text
            else:
                for para in shape.text_frame.paragraphs:
                    if para.text.strip():
                        slide_data["bullets"].append(para.text.strip())
    data["slides"].append(slide_data)

with open("output.json", "w") as f:
    json.dump(data, f, indent=2)
```

## Editing existing presentations

Use the OOXML workflow for editing existing presentations:

1. Unpack: `python ooxml/scripts/unpack.py <file.pptx> <output_dir>`
2. Edit XML files in `ppt/slides/slide{N}.xml`
3. Validate: `python ooxml/scripts/validate.py <dir> --original <file.pptx>`
4. Repack: `python ooxml/scripts/pack.py <dir> <output.pptx>`

### Key XML paths
- `ppt/slides/slide{N}.xml` — slide contents
- `ppt/notesSlides/notesSlide{N}.xml` — speaker notes
- `ppt/theme/theme1.xml` — theme colors and fonts

## Dependencies

- **python-pptx**: `pip install python-pptx` (create/read/edit presentations)
- **markitdown**: `pip install "markitdown[pptx]"` (text extraction)
