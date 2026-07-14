---
name: nano-pdf
description: Work with PDFs — extract text, merge files, and parse structured data using Python.
---

# PDF Operations

## Extract text from PDF pages

Use `pdfplumber` to extract text from each page:

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        print(f"Page {i+1}:\n{text}")
```

Titles, authors, dates, and all content are in the **page text**, NOT in PDF metadata. Always extract and parse page text.

## Parse specific fields from page text

The first line of extracted page text is typically the title. Parse other fields by searching for labeled lines:

```python
import pdfplumber

with pdfplumber.open("doc.pdf") as pdf:
    page_text = pdf.pages[0].extract_text() or ""
    lines = page_text.strip().split("\n")

    title = lines[0] if lines else ""

    author = ""
    for line in lines:
        if "Author:" in line:
            author = line.split("Author:")[-1].strip()
```

## Merge PDFs

Use `PdfWriter` from `pypdf` (PdfMerger was removed in v6+):

```python
from pypdf import PdfWriter

writer = PdfWriter()
writer.append("doc_a.pdf")
writer.append("doc_b.pdf")
writer.write("merged.pdf")
writer.close()
```

Or use CLI: `pdfunite doc_a.pdf doc_b.pdf merged.pdf`

## Get page count

```python
from pypdf import PdfReader
num_pages = len(PdfReader("file.pdf").pages)
```

## Parse numeric data from text

```python
import re

text = page.extract_text()
# Dollar amounts: "$2,450,000" -> 2450000
match = re.search(r"\$?([\d,]+)", text)
value = int(match.group(1).replace(",", ""))

# Percentages: "25.7%" -> 25.7
match = re.search(r"([\d.]+)%", text)
pct = float(match.group(1))
```

## Install

```bash
pip install pdfplumber pypdf
```
