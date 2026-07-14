---
name: document-pptx
description: "Create, read, and extract data from PowerPoint .pptx files using python-pptx. IMPORTANT: Do NOT call 'document-pptx' as a tool. Instead use write_file and execute_command. Procedure: (1) pip install python-pptx, (2) write a .py script, (3) save as .py file, (4) run with python3. CREATE presentations: from pptx import Presentation; prs=Presentation(); slide=prs.slides.add_slide(prs.slide_layouts[0]); slide.shapes.title.text='Title'; slide.placeholders[1].text='Subtitle'; slide2=prs.slides.add_slide(prs.slide_layouts[1]); slide2.shapes.title.text='Heading'; tf=slide2.placeholders[1].text_frame; tf.text='First bullet'; tf.add_paragraph().text='Second bullet'; prs.save('out.pptx'). EXTRACT text: from pptx import Presentation; prs=Presentation('file.pptx'); lines=[]; [lines.extend([shape.text for shape in slide.shapes if hasattr(shape,'text')]) for slide in prs.slides]; open('out.txt','w').write('\\n'.join(lines)). EXTRACT to JSON: read each slide title via slide.shapes.title.text, read bullets via slide.placeholders[1].text_frame.paragraphs, parse numbers with float(s.replace('$','').replace('M','').replace(',','').replace('%','')), write with json.dump(). slide_layouts[0]=title layout, slide_layouts[1]=bullet layout. Use for ANY .pptx task."
---

# Working with PPTX files

Use **python-pptx** for ALL pptx operations.

**IMPORTANT**: Do NOT call "document-pptx" as a tool. Use write_file + execute_command.

## Extracting data from PPTX to JSON

A bundled script exists. Run with execute_command:
```
python3 scripts/extract_pptx.py input.pptx output.json
```
Extracts: title, subtitle, slide_count, slides (title+bullets), total_revenue, regions, yoy_growth.

If writing your own extraction script, follow this pattern:
```python
from pptx import Presentation
import json, re

prs = Presentation("input.pptx")
title = ""
subtitle = ""
slides = []

for i, slide in enumerate(prs.slides):
    slide_title = slide.shapes.title.text.strip() if slide.shapes.title else ""
    bullets = []
    for shape in slide.shapes:
        if shape.has_text_frame and shape != slide.shapes.title:
            if i == 0:
                subtitle = shape.text_frame.text.strip()
            else:
                for para in shape.text_frame.paragraphs:
                    t = para.text.strip()
                    if t:
                        bullets.append(t)
    if i == 0:
        title = slide_title
    slides.append({"title": slide_title, "bullets": bullets})

# Parse financial data from bullets
total_revenue = None
regions = []
yoy_growth = None
for s in slides:
    for b in s["bullets"]:
        m = re.match(r'Total Revenue:\s*\$?([\d.]+)\s*M', b)
        if m:
            total_revenue = float(m.group(1))
        m = re.match(r'YoY Growth:\s*([\d.]+)\s*%', b)
        if m:
            yoy_growth = int(float(m.group(1)))
        m = re.match(r'(.+?):\s*\$?([\d.]+)\s*M', b)
        if m and 'Revenue' not in m.group(1) and 'Growth' not in m.group(1):
            regions.append({"name": m.group(1).strip(), "revenue": float(m.group(2))})

result = {"title": title, "subtitle": subtitle, "slide_count": len(prs.slides),
          "slides": slides, "total_revenue": total_revenue, "regions": regions, "yoy_growth": yoy_growth}
with open("slides_data.json", "w") as f:
    json.dump(result, f, indent=2)
```

## Creating a PPTX

1. Install: `pip install python-pptx`
2. Write a Python script with write_file:

```python
from pptx import Presentation

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

prs.save("output.pptx")
```

3. Run with execute_command: `python3 script.py`

## Extracting text to a file

```python
from pptx import Presentation

prs = Presentation("input.pptx")
lines = []
for slide in prs.slides:
    for shape in slide.shapes:
        if hasattr(shape, "text"):
            lines.append(shape.text)
with open("output.txt", "w") as f:
    f.write("\n".join(lines))
```
