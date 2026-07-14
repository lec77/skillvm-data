---
name: nano-pdf
description: Work with PDFs — merge, extract text, edit — using Python (pypdf) and nano-pdf CLI.
---

# nano-pdf

## Install

```bash
pip install pypdf nano-pdf
```

## Merge PDFs

```python
from pypdf import PdfReader, PdfWriter
writer = PdfWriter()
for pdf_file in ["a.pdf", "b.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)
writer.write("merged.pdf")
```

## Extract text and data from PDF pages

**CRITICAL:** Titles, authors, dates, and other document info are rendered as visible text on PDF pages. They are NOT in PDF metadata. You MUST extract them by reading the page text, then parsing lines. Preserve original case — do NOT lowercase extracted values.

Do NOT use `reader.metadata` — it is almost always empty/generic.

```python
from pypdf import PdfReader
reader = PdfReader("doc.pdf")
text = reader.pages[0].extract_text()
for line in text.split('\n'):
    stripped = line.strip()
    if stripped.lower().startswith("author:"):
        # Preserve original case of the value
        author = stripped.split(":", 1)[1].strip()
```

The first non-empty line of a page is typically the title. Always extract ALL requested fields (title, author, dates, numbers) by parsing the visible text content. Keep the original capitalization.

## Get page count

```python
reader = PdfReader("file.pdf")
page_count = len(reader.pages)
```

## Edit a PDF page with nano-pdf CLI

```bash
nano-pdf edit deck.pdf 1 "Change the title to 'Q3 Results'"
```
