---
name: nano-pdf
description: Work with PDFs — extract text, merge files, and edit pages using Python and nano-pdf CLI.
---

# PDF Operations Guide

## Setup

```bash
source .venv/bin/activate 2>/dev/null || (python3 -m venv .venv && source .venv/bin/activate)
pip install pypdf pdfplumber -q
```

If a `.venv` directory already exists, reuse it.

## Step 1: Always Extract Text First

Before any PDF task, extract and print the raw text from every page. This is how you discover what's in the PDF.

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        print(f"--- Page {i+1} ---")
        print(text)
```

**CRITICAL**: Titles, authors, dates, and all data are in the **page text content**, NOT in PDF file metadata. Do NOT use `reader.metadata` — it is almost always empty or wrong. Always parse the printed text instead.

## Step 2: Parse Structured Data from Text

After printing raw text, write a Python script to parse the fields you need:

```python
for line in text.split('\n'):
    if "Author:" in line:
        author = line.split("Author:")[-1].strip()
```

The first line of a page is typically the title/heading. For example, if page text starts with "Document A - Introduction", that's the title.

Strip `$`, `,`, `%` before converting numbers:
```python
def parse_number(s):
    return float(s.replace("$","").replace(",","").replace("%","").strip())
```

Write JSON output:
```python
import json
with open("output.json", "w") as f:
    json.dump(data, f, indent=2)
```

## Merge PDFs

```python
from pypdf import PdfWriter

writer = PdfWriter()
writer.append("doc_a.pdf")
writer.append("doc_b.pdf")
writer.write("merged.pdf")
writer.close()
```

Do NOT use `PdfMerger` — it was removed in pypdf v6+. Use `PdfWriter` with `.append()`.

## Get PDF Page Count

```python
from pypdf import PdfReader
page_count = len(PdfReader("file.pdf").pages)
```

## Edit PDF Pages (nano-pdf CLI)

```bash
nano-pdf edit deck.pdf 1 "Change the title to 'Q3 Results'"
```

## Key Rules

1. Use `pdfplumber` for text extraction — it handles layouts better than pypdf
2. Extract titles, authors, dates from **page text**, NOT PDF metadata
3. Print raw text first, then parse — don't guess the format
4. Ensure JSON numbers are int/float, not strings
5. Reuse existing `.venv` if present
6. Always write multi-line `.py` scripts — one-liner `python -c` with `for`/`with` causes syntax errors
