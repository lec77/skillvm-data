---
name: pptx
description: "Presentation creation, editing, and analysis. When working with .pptx files for creating, reading, modifying, or extracting data from presentations."
license: Proprietary. LICENSE.txt has complete terms
---

# PPTX Skill

## Creating Presentations

Use `python-pptx` to create presentations programmatically:

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
tf.text = "First bullet"
tf.add_paragraph().text = "Second bullet"
tf.add_paragraph().text = "Third bullet"

prs.save("output.pptx")
```

Install if needed: `pip install python-pptx`

## Reading / Extracting Content

### Quick text extraction
```bash
python -m markitdown path-to-file.pptx
```
Install if needed: `pip install "markitdown[pptx]"`

### Programmatic extraction with python-pptx
```python
from pptx import Presentation

prs = Presentation("input.pptx")
for slide in prs.slides:
    for shape in slide.shapes:
        if shape.has_text_frame:
            for para in shape.text_frame.paragraphs:
                print(para.text)
```

### Extracting structured data
When extracting slide data to JSON, iterate slides and build structured output:

```python
import json
from pptx import Presentation

prs = Presentation("input.pptx")
data = {"slide_count": len(prs.slides), "slides": []}

for slide in prs.slides:
    slide_data = {"title": "", "bullets": []}
    for shape in slide.shapes:
        if shape.has_text_frame:
            for i, para in enumerate(shape.text_frame.paragraphs):
                text = para.text.strip()
                if not text:
                    continue
                if shape.shape_id == slide.shapes.title.shape_id if slide.shapes.title else False:
                    slide_data["title"] = text
                else:
                    slide_data["bullets"].append(text)
    data["slides"].append(slide_data)

# Extract title/subtitle from first slide
if data["slides"]:
    data["title"] = data["slides"][0].get("title", "")

with open("output.json", "w") as f:
    json.dump(data, f, indent=2)
```

### Saving extracted text to file
```bash
python -m markitdown input.pptx > output.txt
```

## Editing Existing Presentations

For editing existing PPTX files, unpack the ZIP and edit XML directly:

1. Unpack: `python ooxml/scripts/unpack.py <file.pptx> <output_dir>`
2. Edit XML files in `ppt/slides/slide{N}.xml`
3. Validate: `python ooxml/scripts/validate.py <dir> --original <file.pptx>`
4. Repack: `python ooxml/scripts/pack.py <dir> <output.pptx>`

## Key File Structure (OOXML)
- `ppt/slides/slide{N}.xml` - Slide contents
- `ppt/notesSlides/notesSlide{N}.xml` - Speaker notes
- `ppt/slideLayouts/` - Layout templates
- `ppt/theme/` - Theme/styling

## Dependencies
- `python-pptx`: Create and read PPTX programmatically
- `markitdown`: Quick text extraction (`pip install "markitdown[pptx]"`)
