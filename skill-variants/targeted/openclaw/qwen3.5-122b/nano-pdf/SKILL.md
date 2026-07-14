---
name: nano-pdf
description: Work with PDF files — extract text/data, merge, split, count pages, and visually edit slides. Use this skill whenever the task involves PDF files, whether reading content from them, combining them, or modifying their visual appearance.
metadata: {"clawdbot":{"emoji":"📄","requires":{"bins":["nano-pdf"]},"install":[{"id":"uv","kind":"uv","package":"nano-pdf","bins":["nano-pdf"],"label":"Install nano-pdf (uv)"}]}}
---

# PDF Operations

## Reading PDF text

Read PDF files with your read tool. You will see the text content directly. Use it to answer questions, extract data, or build JSON. No Python needed for reading.

If the read tool returns empty or garbled text, use Python:
```python
from pypdf import PdfReader
reader = PdfReader("file.pdf")
for page in reader.pages:
    print(page.extract_text())
```

## Extracting structured data from PDFs

When you need to extract data from a PDF into JSON:

1. First read the PDF to see its text content
2. Parse the text to identify fields, numbers, tables
3. Write the JSON file with the extracted data

Example: extract data from a report PDF into JSON:
```python
import json
from pypdf import PdfReader

reader = PdfReader("report.pdf")
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

# Parse the text content and build your data structure
data = {
    "total_pages": len(reader.pages),
    # ... add other extracted fields
}

with open("output.json", "w") as f:
    json.dump(data, f, indent=2)
```

Important: when extracting numbers from PDF text, remove dollar signs and commas before converting to numbers. For example, "$2,450,000" should become 2450000.

## Merging PDFs

Merging requires Python. Always write a `.py` script file (do NOT use one-liners):

```python
from pypdf import PdfWriter

writer = PdfWriter()
writer.append("doc1.pdf")
writer.append("doc2.pdf")
writer.write("merged.pdf")
writer.close()
```

The `.append()` method adds all pages from a PDF in order. Files are merged in the order you call `.append()`.

## Page count

```python
from pypdf import PdfReader
reader = PdfReader("file.pdf")
print(len(reader.pages))
```

## Extracting titles and authors from PDFs

WARNING: Do NOT use `reader.metadata` to get titles or authors. PDF metadata fields like `/Title` and `/Author` are often empty, "untitled", or "anonymous" even when the document clearly shows a title and author in its visible text.

Instead, ALWAYS extract titles and authors from the visible page text:

```python
from pypdf import PdfReader
reader = PdfReader("file.pdf")
first_page_text = reader.pages[0].extract_text()
print(first_page_text)
# The title is the first line of text on the page
# The author is usually near the top, often after "by" or "Author:" or "Prepared by"
# Parse these from the text content, NOT from reader.metadata
```

For example, if the first page text is:
```
Document A - Introduction
Author: John Smith
Date: 2026-01-15
```
Then the title is "Document A - Introduction" and the author is "John Smith".

## Visual editing (nano-pdf CLI)

The `nano-pdf` CLI uses AI to visually edit or add PDF pages. It cannot extract text, merge, or split.

```bash
nano-pdf edit deck.pdf 1 "Change the title to 'Q3 Results'"
nano-pdf add deck.pdf 0 "Title slide with 'Welcome'"
```

## Rules

- Use `pypdf` (not `PyPDF2`). It is pre-installed as a nano-pdf dependency.
- Always write `.py` script files for Python PDF operations. One-liners with `for`/`with` cause syntax errors.
- `nano-pdf` CLI only does visual editing. It cannot merge, extract text, or split.
- When writing JSON output, use `json.dump()` with `indent=2`.
- Numbers in JSON must be numbers, not strings. Remove "$" and "," from currency values.
