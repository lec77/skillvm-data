---
name: nano-pdf
description: Work with PDFs — extract text, merge files, and edit pages using Python and nano-pdf CLI.
---

# PDF Operations Guide

## Setup

```bash
source .venv/bin/activate 2>/dev/null || (python3 -m venv .venv && source .venv/bin/activate)
pip install pypdf pdfplumber
```

If a `.venv` directory already exists, reuse it.

## Extract Text from PDF

Use `pdfplumber` for text extraction:

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        print(f"--- Page {i+1} ---")
        print(text)
```

**IMPORTANT**: Titles, authors, dates, and other metadata are usually in the **page text content**, not in PDF file metadata. Always extract these by parsing the text from the relevant page. For example, if page 1 contains "Author: John Smith", parse that line to get the author name. Do NOT rely on `reader.metadata` — it is often empty or contains generic values like "anonymous".

## Parse Structured Data from Text

After printing raw text, parse fields like:
```python
for line in text.split('\n'):
    if line.startswith("Author:"):
        author = line.split(":", 1)[1].strip()
    if line.startswith("Title:") or line.startswith("Document"):
        title = line.strip()
```

Strip `$`, `,`, `%` before converting numbers:
```python
def parse_number(s):
    return float(s.replace("$","").replace(",","").replace("%","").strip())
```

Write JSON:
```python
import json
with open("output.json", "w") as f:
    json.dump(data, f, indent=2)
```

## Merge PDFs

```python
from pypdf import PdfReader, PdfWriter

writer = PdfWriter()
for filename in ["a.pdf", "b.pdf"]:
    reader = PdfReader(filename)
    for page in reader.pages:
        writer.add_page(page)
with open("merged.pdf", "wb") as f:
    writer.write(f)
```

## Get PDF Page Count

```python
from pypdf import PdfReader
page_count = len(PdfReader("file.pdf").pages)
```

## Edit PDF Pages

```bash
nano-pdf edit deck.pdf 1 "Change the title to 'Q3 Results'"
```

## Key Rules

1. Use `pdfplumber` for text extraction — it handles layouts better than pypdf
2. Extract titles, authors, dates from **page text**, not PDF metadata
3. Print raw text first, then parse — don't guess the format
4. Ensure JSON numbers are int/float, not strings
5. Reuse existing `.venv` if present
