---
name: nano-pdf
description: Work with PDFs — extract text, merge, get page counts — using Python pypdf. Use nano-pdf CLI only for visual editing.
---

# PDF Operations with pypdf

**DO NOT use `nano-pdf` CLI for reading, extracting, or merging PDFs.** It only does visual editing and needs GEMINI_API_KEY.

**DO NOT use the built-in read tool on PDF files.** It cannot extract text from PDFs.

**ALWAYS write Python scripts to .py files and run them.** Never use `python -c` with inline code — it breaks on for loops and multiline code.

## Setup

```bash
pip install pypdf
```

## Extract text from a PDF — write this script to a file and run it

Save as `extract.py`:
```python
from pypdf import PdfReader
import json

reader = PdfReader("INPUT.pdf")
total_pages = len(reader.pages)
all_text = []
for i, page in enumerate(reader.pages):
    text = page.extract_text()
    all_text.append(text)
    print(f"=== Page {i} ===")
    print(text)
print(f"Total pages: {total_pages}")
```

Run: `python extract.py`

## Finding titles, authors, and data in PDF text

Titles, authors, dates, and all document info are in the **visible page text**, NOT in PDF metadata. You MUST parse lines from `extract_text()` to find them.

Example: if a PDF page contains "Author: John Smith", extract it like this:
```python
text = reader.pages[0].extract_text()
for line in text.split('\n'):
    stripped = line.strip()
    if stripped.lower().startswith("author:"):
        author = stripped.split(":", 1)[1].strip()  # "John Smith" (original case)
```

**CRITICAL: Do NOT lowercase the line before extracting the value.** Only use `.lower()` for comparison (e.g. `startswith`), then extract from the original line to preserve "John Smith", not "john smith".

The first non-empty line of a page is usually the title:
```python
text = reader.pages[0].extract_text()
title = ""
for line in text.split('\n'):
    if line.strip():
        title = line.strip()
        break
```

**NEVER hardcode placeholder values like "Author A" or "Title".** Always extract actual values from the PDF text by parsing each line.

## Merge PDFs — write this script to a file and run it

Save as `merge.py`:
```python
from pypdf import PdfReader, PdfWriter

writer = PdfWriter()
for f in ["a.pdf", "b.pdf"]:
    reader = PdfReader(f)
    for page in reader.pages:
        writer.add_page(page)
writer.write("merged.pdf")
print("Merged successfully")
```

Run: `python merge.py`

## Write JSON output — write this script to a file and run it

Save as `write_json.py`:
```python
import json

data = {"key": "value"}
with open("output.json", "w") as f:
    json.dump(data, f, indent=2)
print("JSON written")
```

Run: `python write_json.py`

## Workflow for PDF tasks

1. `pip install pypdf`
2. Write a Python script to a `.py` file using the write/edit tool
3. Run `python script.py` with bash
4. Check output and fix if needed

## Edit a PDF page (visual changes only)

```bash
nano-pdf edit deck.pdf 1 "Change the title to 'Q3 Results'"
```

Only use for visual edits. Requires GEMINI_API_KEY.
