---
name: pptx
description: "Presentation creation, editing, and analysis. When Claude needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks"
license: Proprietary. LICENSE.txt has complete terms
---

# PPTX Creation and Extraction

## Creating a new PowerPoint presentation

ALWAYS use python-pptx to create presentations. NEVER use pptxgenjs or html2pptx.

### Step 1: Install python-pptx
```bash
pip install python-pptx
```

### Step 2: Write a Python script to create the presentation

Use this exact pattern:

```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()

# Title slide (layout index 0)
slide = prs.slides.add_slide(prs.slide_layouts[0])
slide.shapes.title.text = "Title Here"
slide.placeholders[1].text = "Subtitle Here"

# Content slide with bullets (layout index 1)
slide = prs.slides.add_slide(prs.slide_layouts[1])
slide.shapes.title.text = "Slide Title"
tf = slide.placeholders[1].text_frame
tf.text = "First bullet point"
tf.add_paragraph().text = "Second bullet point"
tf.add_paragraph().text = "Third bullet point"

prs.save("output.pptx")
```

**Layout indices**:
- 0 = Title slide (has title + subtitle)
- 1 = Title and Content (has title + body with bullets)

### Step 3: Extract text after creating

After creating the .pptx file, extract text using markitdown:
```bash
python -m markitdown output.pptx > output_text.txt
```

If markitdown is not installed: `pip install "markitdown[pptx]"`

## Reading and extracting data from a PPTX

### Method 1: Text extraction with markitdown
```bash
python -m markitdown input.pptx
```
This outputs markdown with slide numbers and all text content.

### Method 2: Structured extraction with python-pptx

Use this pattern to extract structured data:

```python
from pptx import Presentation
import json

prs = Presentation("input.pptx")
data = {
    "slide_count": len(prs.slides),
    "slides": []
}

for slide in prs.slides:
    slide_data = {"title": "", "bullets": []}
    if slide.shapes.title:
        slide_data["title"] = slide.shapes.title.text
    for shape in slide.shapes:
        if shape.has_text_frame and shape != slide.shapes.title:
            for para in shape.text_frame.paragraphs:
                text = para.text.strip()
                if text:
                    slide_data["bullets"].append(text)
    data["slides"].append(slide_data)

# Extract title/subtitle from first slide
if prs.slides:
    first = prs.slides[0]
    data["title"] = first.shapes.title.text if first.shapes.title else ""
    for ph in first.placeholders:
        if ph.placeholder_format.idx == 1:
            data["subtitle"] = ph.text

with open("slides_data.json", "w") as f:
    json.dump(data, f, indent=2)
```

**IMPORTANT**: When extracting numeric data from text (like "$4.2M" or "23%"):
- Parse numbers from the text strings using Python
- Example: `float("$4.2M".replace("$","").replace("M",""))` gives `4.2`
- Example: `int("23%".replace("%",""))` gives `23`

## Editing an existing PPTX

Use python-pptx to read, modify, and save:

```python
from pptx import Presentation

prs = Presentation("input.pptx")
# Access slides: prs.slides[0], prs.slides[1], etc.
# Modify text: slide.shapes.title.text = "New Title"
# Save: prs.save("output.pptx")
```

## Dependencies

- **python-pptx**: `pip install python-pptx` (create and edit presentations)
- **markitdown**: `pip install "markitdown[pptx]"` (extract text as markdown)
