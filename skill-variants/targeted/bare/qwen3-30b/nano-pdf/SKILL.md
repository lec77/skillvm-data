---
name: nano-pdf
description: LOAD THIS SKILL for any PDF task - merge PDFs, extract text from PDFs, get page counts, parse PDF content to JSON. Contains exact Python code patterns you need.
---

# nano-pdf - PDF Operations Guide

**IMPORTANT: For PDF tasks, always use Python with pdfplumber and pypdf. Install them first:**

```bash
pip install pypdf pdfplumber
```

## Extract ALL text from a PDF

Use pdfplumber - it extracts text much better than PyPDF2:

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    total_pages = len(pdf.pages)
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        print(f"=== PAGE {i+1} ===")
        print(text)
```

**Always extract and print ALL text first** before writing any JSON. This lets you see the actual content to parse.

## Merge PDFs

```python
from pypdf import PdfReader, PdfWriter

writer = PdfWriter()
for f in ["doc_a.pdf", "doc_b.pdf"]:
    for page in PdfReader(f).pages:
        writer.add_page(page)
writer.write("merged.pdf")
```

## Get page count

```python
from pypdf import PdfReader
count = len(PdfReader("file.pdf").pages)
```

## Extract titles and authors from PDF text

Titles are usually the first prominent line of text on page 1. Authors often appear after "Author:" or similar labels. After extracting text with pdfplumber, parse it line by line:

```python
text = page.extract_text()
lines = [l.strip() for l in text.split('\n') if l.strip()]
# First line is typically the title
title = lines[0] if lines else ""
# Look for author in subsequent lines
author = ""
for line in lines:
    if "author" in line.lower() or "by " in line.lower() or "prepared by" in line.lower():
        # Extract the name part after the label
        for sep in [":", "by", "By"]:
            if sep in line:
                author = line.split(sep, 1)[1].strip()
                break
```

## Extract tables from PDF

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                print(row)
```

## Parse numbers from text

- Dollar amounts: `int("2,450,000".replace(",","").replace("$",""))` → 2450000
- Percentages: `float("25.7%".replace("%",""))` → 25.7

## Write JSON output

```python
import json
with open("output.json", "w") as f:
    json.dump(data, f, indent=2)
```

## Workflow for any PDF task

1. `pip install pypdf pdfplumber`
2. Extract ALL text from the PDF using pdfplumber and print it
3. Examine the printed text to understand the structure
4. Parse the text to extract the required fields
5. Write the result to JSON
6. Read the JSON file to verify it looks correct
