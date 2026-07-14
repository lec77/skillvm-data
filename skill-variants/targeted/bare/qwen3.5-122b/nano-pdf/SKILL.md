---
name: nano-pdf
description: "Work with PDF files using Python + PyPDF2. ALWAYS pip install PyPDF2 first. Use PdfReader to extract text (page.extract_text()), PdfMerger to merge PDFs. Page count = len(reader.pages). CRITICAL: when extracting author names or titles from PDFs, NEVER use PDF metadata (it often says 'anonymous'/'untitled'). Instead extract text from page 1 and parse it: title is the first line, author is on a line containing 'Author:'. For money values remove $ and commas, for percentages remove %. Output JSON with json.dump(data, f, indent=2). Numbers must be int/float not strings."
---

# PDF Operations with Python + PyPDF2

ALWAYS use Python with PyPDF2 for ALL PDF operations. Install first:

```bash
pip install PyPDF2
```

## Extract Text from a PDF

```python
from PyPDF2 import PdfReader

reader = PdfReader("input.pdf")
page_count = len(reader.pages)

for i, page in enumerate(reader.pages):
    text = page.extract_text()
    print(f"--- Page {i+1} ---")
    print(text)
```

## Merge Multiple PDFs

```python
from PyPDF2 import PdfMerger

merger = PdfMerger()
merger.append("file1.pdf")  # pages from file1 come first
merger.append("file2.pdf")  # pages from file2 come after
merger.write("merged.pdf")
merger.close()

# Verify merged page count
reader = PdfReader("merged.pdf")
print(f"Merged has {len(reader.pages)} pages")
```

## Get Page Count

```python
from PyPDF2 import PdfReader
count = len(PdfReader("file.pdf").pages)
```

## Extract Author, Title, and Other Info from PDF Text

**CRITICAL: Author names and titles are in the PAGE TEXT, not in PDF metadata.**

PDF metadata fields (like `reader.metadata`) often contain generic values like "anonymous" or "untitled". NEVER use PDF metadata for author/title extraction. ALWAYS extract from the actual page text content.

**Procedure to find author and title:**

1. Extract text from page 1: `reader.pages[0].extract_text()`
2. The TITLE is usually the first line of text
3. The AUTHOR is on a line containing "Author:" — parse it like this:

```python
from PyPDF2 import PdfReader

reader = PdfReader("doc.pdf")
text = reader.pages[0].extract_text()
lines = text.split("\n")

# Title = first non-empty line
title = ""
for line in lines:
    if line.strip():
        title = line.strip()
        break

# Author = text after "Author:" on any line
author = ""
for line in lines:
    if "Author:" in line:
        author = line.split("Author:")[1].strip()
        break

print(f"Title: {title}")
print(f"Author: {author}")
```

## Extract Structured Data to JSON

When extracting data from a PDF into JSON:

1. Read the PDF and extract all text from every page
2. Parse the text line by line to find required values
3. Convert money strings to numbers: remove `$` and `,` then use `int()` or `float()`
4. Convert percentages to numbers: remove `%` then use `float()`
5. Write result with `json.dump(data, f, indent=2)`

**Example — parsing "$2,450,000" and "25.7%":**

```python
def parse_money(s):
    return int(s.replace("$", "").replace(",", ""))
# parse_money("$2,450,000") => 2450000

def parse_percent(s):
    return float(s.replace("%", ""))
# parse_percent("25.7%") => 25.7
```

## Write JSON Output

```python
import json
with open("output.json", "w") as f:
    json.dump(data, f, indent=2)
```

## Rules

- ALWAYS use PyPDF2 — do NOT use pdfplumber, pdfminer, pdftk, or pdftotext
- ALWAYS `pip install PyPDF2` before importing
- NEVER use PDF metadata for author/title — extract from page text instead
- Numbers in JSON must be int or float, NOT strings
- Page count = `len(reader.pages)`
- Text from page: `page.extract_text()`
