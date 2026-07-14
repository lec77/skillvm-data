---
name: nano-pdf
description: Work with PDF files — extract text/data, merge, split, count pages, and visually edit slides. Use this skill whenever the task involves PDF files, whether reading content from them, combining them, or modifying their visual appearance.
---

# PDF Operations

## Reading PDF text

Read the PDF with your read tool. You'll see the text content directly — use it to answer questions, extract data, or build JSON. No Python needed for reading.

If the read tool returns empty or garbled text, fall back to a Python script:
```python
from pypdf import PdfReader
reader = PdfReader("file.pdf")
for page in reader.pages:
    print(page.extract_text())
```

## Merging PDFs

Merging requires Python. Write a `.py` file (not a one-liner — `for`/`with` on a single line causes syntax errors):

```python
from pypdf import PdfWriter

writer = PdfWriter()
writer.append("doc1.pdf")
writer.append("doc2.pdf")
writer.write("merged.pdf")
writer.close()
```

## Page count

```python
from pypdf import PdfReader
reader = PdfReader("file.pdf")
print(len(reader.pages))
```

## Visual editing (nano-pdf CLI)

The `nano-pdf` CLI uses AI to visually edit or add PDF pages. It cannot extract text, merge, or split.

```bash
nano-pdf edit deck.pdf 1 "Change the title to 'Q3 Results'"
nano-pdf add deck.pdf 0 "Title slide with 'Welcome'"
```

## Important

- Use `pypdf` (not `PyPDF2`). It's pre-installed as a nano-pdf dependency.
- Always write `.py` scripts for Python PDF operations — one-liners with `for`/`with` cause syntax errors.
- `nano-pdf` CLI only does visual editing — commands like `merge` or `extract` don't exist.
