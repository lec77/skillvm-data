---
name: nano-pdf
description: Work with PDFs — extract text, merge files, get page counts, and edit pages.
homepage: https://pypi.org/project/nano-pdf/
metadata: {"clawdbot":{"emoji":"📄","requires":{"bins":["nano-pdf"]},"install":[{"id":"uv","kind":"uv","package":"nano-pdf","bins":["nano-pdf"],"label":"Install nano-pdf (uv)"}]}}
---

# nano-pdf

## CRITICAL: nano-pdf CLI only does `edit` and `add`

For text extraction, merging, page counting, or any PDF reading — write a Python script and run with `python3`.

## Ignore LSP errors for pdfminer and pypdf

Both `pdfminer` and `pypdf` are installed system-wide. LSP may show "Import could not be resolved" — ignore it. Just run the script with `python3`.

## Extract text from PDF

You CANNOT read PDFs with the read tool. PDFs are binary files. Write a Python script:

```python
# extract.py
from pdfminer.high_level import extract_text
text = extract_text("file.pdf")
print(text)
```

Run `python3 extract.py`, read the output, then write a second script to parse the text into structured data.

## CRITICAL: PDF metadata vs text content

**PDF metadata fields (reader.metadata /Title, /Author) are almost always empty.** Do NOT rely on them.

All information (titles, authors, dates, etc.) is in the **rendered text content**. Use `pdfminer.high_level.extract_text()` to get the text, then parse it with string operations or regex.

Example: if a PDF page shows "Author: John Smith", extract it like:
```python
import re
text = extract_text("doc.pdf")
m = re.search(r'Author:\s*(.+)', text)
author = m.group(1).strip() if m else ""
```

## Two-step workflow for text extraction

1. **Step 1**: Extract and PRINT the raw text so you can see it:
   ```python
   from pdfminer.high_level import extract_text
   text = extract_text("file.pdf")
   print(repr(text))  # use repr to see whitespace/newlines
   ```
   Run this and READ the output carefully.

2. **Step 2**: Based on what you see, write a parsing script that extracts the needed fields from the text. NEVER guess or hardcode values.

## Merge PDFs

```python
from pypdf import PdfReader, PdfWriter
writer = PdfWriter()
for f in ["a.pdf", "b.pdf"]:
    for page in PdfReader(f).pages:
        writer.add_page(page)
writer.write("merged.pdf")
```

## Count pages

```python
from pypdf import PdfReader
print(len(PdfReader("file.pdf").pages))
```

## Rules

1. Write Python to `.py` files, run with `python3` — never use `python3 -c` for multi-line code
2. Do NOT pip install pdfminer or pypdf — they are pre-installed
3. Always extract text first, PRINT it, read the output, then parse — NEVER hardcode values
4. Use `json.dump()` with `indent=2` for JSON output
5. NEVER use PDF metadata fields — always parse from extracted text content
