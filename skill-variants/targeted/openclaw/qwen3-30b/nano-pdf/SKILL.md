---
name: nano-pdf
description: Work with PDFs — edit, read, merge, and extract data using CLI tools and Python.
homepage: https://pypi.org/project/nano-pdf/
metadata: {"clawdbot":{"emoji":"📄","requires":{"bins":["nano-pdf"]},"install":[{"id":"uv","kind":"uv","package":"nano-pdf","bins":["nano-pdf"],"label":"Install nano-pdf (uv)"}]}}
---

# nano-pdf

## Editing PDFs

```bash
nano-pdf edit deck.pdf 1 "Change the title to 'Q3 Results'"
```

Page numbering may be 0-based or 1-based; retry with the other if off.

## Extracting Data from PDFs — Use Python

**Always write a Python script for PDF data extraction.** Do not chain shell pipes (awk/sed/grep). One Python script is more reliable.

### Recommended workflow

1. Extract full text with `pdftotext -layout file.pdf file.txt` (one file at a time)
2. Get page count with `pdfinfo file.pdf` (one file at a time)
3. Write a Python script to parse the text and output JSON

### Example: Extract structured data

```python
import json, re

with open("report.txt") as f:
    text = f.read()

# Parse sections from text content
# Look for patterns like "Key Highlights:", bullet points, tables
# Extract ALL bullet points under highlight sections as highlight strings
# Parse tabular data (region, revenue, growth) line by line

data = {
    "title": "...",
    "highlights": ["bullet 1", "bullet 2", ...],
    "regions": [{"name": "North", "revenue": 820000, "growth": 18}, ...]
}

with open("output.json", "w") as f:
    json.dump(data, f, indent=2)
```

### Key rules for text extraction

- **Author/title info:** Look in the **visible text content** of pages, not PDF metadata. PDF metadata fields (from `pdfinfo`) are often generic ("anonymous", "untitled"). The real author/title is usually printed on the first page as text.
- **Highlights:** Extract complete bullet-point strings. If the PDF says "Key Highlights:" followed by "- North region grew 18%", include the full bullet text.
- **Numbers:** Strip currency symbols and commas before converting to numbers (e.g., "$2,450,000" → 2450000).
- **Percentages:** Convert "25.7%" to the number 25.7.

## Merging PDFs

```bash
pdfunite doc_a.pdf doc_b.pdf merged.pdf
```

Or in Python with pypdf:

```python
from pypdf import PdfReader, PdfWriter

writer = PdfWriter()
for pdf_path in ["a.pdf", "b.pdf"]:
    writer.append(pdf_path)
writer.write("merged.pdf")
writer.close()
```

## Multi-file operations (merge + extract info)

For tasks involving multiple PDFs, write one Python script that does everything:

```python
from pypdf import PdfReader, PdfWriter
import json

def get_info(filename):
    reader = PdfReader(filename)
    page_count = len(reader.pages)
    # Extract text from first page to find title and author
    first_page_text = reader.pages[0].extract_text()
    # Parse title from first line, author from "Author: ..." line
    # DO NOT use reader.metadata.author — it is often wrong/generic
    lines = first_page_text.split("\n")
    title = lines[0].strip()  # Usually the first line
    author = ""
    for line in lines:
        if "Author:" in line:
            author = line.split("Author:")[-1].strip()
    return {"filename": filename, "page_count": page_count, "title": title, "author": author}

# Merge
writer = PdfWriter()
for f in ["doc_a.pdf", "doc_b.pdf"]:
    writer.append(f)
writer.write("merged.pdf")
writer.close()

# Gather info
info_a = get_info("doc_a.pdf")
info_b = get_info("doc_b.pdf")
merged_pages = len(PdfReader("merged.pdf").pages)

result = {
    "source_files": [
        {"filename": info_a["filename"], "page_count": info_a["page_count"]},
        {"filename": info_b["filename"], "page_count": info_b["page_count"]}
    ],
    "merged_page_count": merged_pages,
    "merged_filename": "merged.pdf",
    "doc_a_title": info_a["title"],
    "doc_b_title": info_b["title"],
    "doc_a_author": info_a["author"],
    "doc_b_author": info_b["author"]
}

with open("pdf_info.json", "w") as f:
    json.dump(result, f, indent=2)
```

Install if needed: `pip install pypdf`

## Important

- `pdfinfo` and `pdftotext` accept ONE file at a time only.
- Never use PDF metadata for author/title — read the actual page text instead.
- Always use Python (not shell pipes) for parsing and JSON output.
