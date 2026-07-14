---
name: pptx
description: Create, read, and edit PowerPoint (.pptx) files
---

# PPTX Skill

## Rules
1. Write Python to a `.py` file and run `python file.py`. NEVER use `python -c`.
2. Quote brackets in pip: `pip install 'markitdown[pptx]'`

## Install
```bash
pip install -q python-pptx 'markitdown[pptx]'
```

## Create a presentation

```python
# save as create.py, run: python create.py
from pptx import Presentation
prs = Presentation()

# Title slide (layout 0)
s = prs.slides.add_slide(prs.slide_layouts[0])
s.shapes.title.text = "Title"
s.placeholders[1].text = "Subtitle"

# Content slide (layout 1) with bullets
s = prs.slides.add_slide(prs.slide_layouts[1])
s.shapes.title.text = "Section"
tf = s.placeholders[1].text_frame
tf.text = "Bullet 1"
tf.add_paragraph().text = "Bullet 2"

prs.save("output.pptx")
```

## Extract text from a presentation
```bash
python -m markitdown input.pptx > output.txt
```

## Extract structured data from a presentation
1. Run `python -m markitdown file.pptx` to get the text
2. Read the output carefully
3. Write the JSON file directly — include ALL requested fields exactly as specified
4. IMPORTANT: The `slides` array MUST have one entry per slide. Title slides get `"bullets": []`
5. For numeric values: "$4.2M" = 4.2, "23%" = 23
6. If `slide_count` is 4, the `slides` array must have exactly 4 entries
