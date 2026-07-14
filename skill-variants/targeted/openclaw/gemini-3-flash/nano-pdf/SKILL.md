---
name: nano-pdf
description: Edit PDFs with natural-language instructions using the nano-pdf CLI.
homepage: https://pypi.org/project/nano-pdf/
metadata: {"clawdbot":{"emoji":"📄","requires":{"bins":["nano-pdf"]},"install":[{"id":"uv","kind":"uv","package":"nano-pdf","bins":["nano-pdf"],"label":"Install nano-pdf (uv)"}]}}
---

# nano-pdf

Edit PDFs with `nano-pdf edit <file> <page> "<instruction>"`. Page numbers may be 0- or 1-based; retry with the other if the result is off by one.

## PDF operations cheat-sheet

### Edit a page
```bash
nano-pdf edit deck.pdf 1 "Change the title to ‘Q3 Results’"
```

### Extract text from a PDF
Use `pdftotext` (available by default):
```bash
pdftotext input.pdf output.txt        # full document
pdftotext -f 1 -l 1 input.pdf -       # first page only, to stdout
```
**Important:** Author names, titles, and other human-written content are in the *text body* of the PDF, not in PDF metadata. Always use `pdftotext` to read the actual page text when extracting information like author names, titles, dates, etc. Do NOT rely on `pdftk dump_data` metadata fields (Creator/Author/Title) — those contain tool defaults like "anonymous" or "untitled", not the real document content.

### Get page count
```bash
pdftk input.pdf dump_data | grep NumberOfPages
```

### Merge PDFs
```bash
pdftk doc_a.pdf doc_b.pdf cat output merged.pdf
```

### Read structured data from PDF text
When extracting structured information from PDF text, read the full text first, then parse:
```bash
pdftotext doc.pdf doc_text.txt
cat doc_text.txt
```
Then construct your JSON from the text content you see.
