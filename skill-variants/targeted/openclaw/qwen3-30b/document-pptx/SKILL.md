---
name: pptx
description: "Presentation creation, editing, and analysis. When Claude needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks"
license: Proprietary. LICENSE.txt has complete terms
---

# PPTX creation, editing, and analysis

**CRITICAL RULES**:
1. Always write Python code to a `.py` file and run with `python script.py`. NEVER use `python -c "..."` for multi-line code — it fails due to indentation.
2. In zsh, quote brackets in pip commands: `pip install 'markitdown[pptx]'`
3. For reading/extracting data from PPTX: use markitdown to get text, then write the output JSON directly. Do NOT write Python scripts with regex to parse PPTX data.

## Installing dependencies

```bash
pip install -q python-pptx
pip install -q 'markitdown[pptx]'
```

## Creating a new presentation

**Use python-pptx** — write a script file, then run it:

```python
# save as create_pptx.py, then run: python create_pptx.py
from pptx import Presentation

prs = Presentation()

# Title slide (layout 0) — has title + subtitle
slide = prs.slides.add_slide(prs.slide_layouts[0])
slide.shapes.title.text = "My Title"
slide.placeholders[1].text = "My Subtitle"

# Content slide (layout 1) — has title + bullet body
slide = prs.slides.add_slide(prs.slide_layouts[1])
slide.shapes.title.text = "Section Title"
tf = slide.placeholders[1].text_frame
tf.text = "First bullet point"
tf.add_paragraph().text = "Second bullet point"
tf.add_paragraph().text = "Third bullet point"

prs.save("output.pptx")
```

Key layouts:
- `prs.slide_layouts[0]` — Title slide (title + subtitle)
- `prs.slide_layouts[1]` — Title + content (title + bullet body)

### Text extraction after creation

```bash
python -m markitdown output.pptx > output_text.txt
```

## Reading and extracting data from a presentation

**MANDATORY WORKFLOW** — follow these exact steps:

### Step 1: Extract text with markitdown

```bash
pip install -q 'markitdown[pptx]'
python -m markitdown input.pptx
```

This produces clean, readable markdown with all slide content:
```
<!-- Slide number: 1 -->
# Title Text
Subtitle Text

<!-- Slide number: 2 -->
# Section Title
Bullet point 1
Bullet point 2
```

### Step 2: Read the markitdown output

Read the text output carefully. Identify all the data you need.

### Step 3: Write the JSON file directly

Using the write/file tool, create the JSON output file with the exact data from the markitdown output. Parse numbers yourself from the text. For example, "$4.2M" means 4.2 in millions, "23%" means 23 as a number.

**DO NOT write a Python script to parse PPTX files programmatically.** The markitdown text output has all the information you need. Just read it and write the JSON directly.

## Raw XML access

For comments, speaker notes, animations:
```bash
python ooxml/scripts/unpack.py <office_file> <output_dir>
```

## Creating styled presentations (with design, charts, images)

For visually styled presentations, use the **html2pptx** workflow. Read [`html2pptx.md`](html2pptx.md) for guidance.

## Editing an existing presentation

For modifying existing PPTX files via XML, read [`ooxml.md`](ooxml.md) for the unpack → edit → validate → pack workflow.
