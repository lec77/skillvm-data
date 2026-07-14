---
name: nano-pdf
description: Work with PDFs — extract text, merge files, get page counts, and edit pages.
homepage: https://pypi.org/project/nano-pdf/
metadata: {"clawdbot":{"emoji":"📄","requires":{"bins":["nano-pdf"]},"install":[{"id":"uv","kind":"uv","package":"nano-pdf","bins":["nano-pdf"],"label":"Install nano-pdf (uv)"}]}}
---

# nano-pdf

## IMPORTANT: nano-pdf CLI limitations

`nano-pdf` only has `edit` and `add` commands. It CANNOT extract text, merge, or count pages.

For ALL other PDF operations, write a Python script file and run it with `python3`.

## IMPORTANT: Ignore LSP errors for pdfminer and pypdf

LSP may show "Import could not be resolved" for `pdfminer` and `pypdf`. Ignore these errors — both libraries ARE installed system-wide. Just run the script with `python3` and it will work.

## How to read text from a PDF

You CANNOT read PDFs with the read tool. PDFs are binary files. Write a Python script instead.

Step 1: Extract the text and print it so you can see the content:

```python
# step1_extract.py
from pdfminer.high_level import extract_text
text = extract_text("report.pdf")
print(text)
```

Run with `python3 step1_extract.py` to see the text content.

Step 2: Read the printed output, then write a second script that parses it:

```python
# step2_parse.py
import json, re
from pdfminer.high_level import extract_text
from pypdf import PdfReader

text = extract_text("report.pdf")
lines = [l.strip() for l in text.split('\n') if l.strip()]

# Parse lines to extract data based on what you see in the output
# Example: look for patterns like "Total Revenue: $2,450,000"
data = {}
for line in lines:
    if 'Total Revenue' in line:
        m = re.search(r'\$([\d,]+)', line)
        if m:
            data['total_revenue'] = int(m.group(1).replace(',', ''))

# Count pages
reader = PdfReader("report.pdf")
data['total_pages'] = len(reader.pages)

with open("output.json", "w") as f:
    json.dump(data, f, indent=2)
print("Done")
```

CRITICAL: You MUST parse the actual extracted text. NEVER hardcode or guess values.

## How to merge PDFs

Write a Python script file (do NOT use `python3 -c` for multi-line code):

```python
# merge.py
from pypdf import PdfReader, PdfWriter

writer = PdfWriter()
for filename in ["doc_a.pdf", "doc_b.pdf"]:
    reader = PdfReader(filename)
    for page in reader.pages:
        writer.add_page(page)

writer.write("merged.pdf")
print("Merged into merged.pdf")
```

Run with `python3 merge.py`.

## How to count pages

```python
from pypdf import PdfReader
reader = PdfReader("file.pdf")
print(len(reader.pages))
```

## Key rules

1. Always write Python code to a `.py` file, then run with `python3`
2. Never use `python3 -c` for code with loops
3. `pdfminer` and `pypdf` are pre-installed — do NOT pip install them
4. Ignore LSP "import could not be resolved" errors for these packages
5. Always extract text first with `pdfminer`, print it, read the output, then parse it
6. NEVER hardcode values — always parse from the actual PDF text
7. Use `json.dump()` to write JSON output
