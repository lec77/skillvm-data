---
name: nano-pdf
description: Work with PDFs — edit, extract text, merge, and get metadata using nano-pdf and system PDF tools.
homepage: https://pypi.org/project/nano-pdf/
metadata: {"clawdbot":{"emoji":"📄","requires":{"bins":["nano-pdf"]},"install":[{"id":"uv","kind":"uv","package":"nano-pdf","bins":["nano-pdf"],"label":"Install nano-pdf (uv)"}]}}
---

# Working with PDFs

## Editing PDFs

Use `nano-pdf edit` to apply visual edits to a PDF page:

```bash
nano-pdf edit deck.pdf 1 "Change the title to ‘Q3 Results’"
```

## Extracting text from PDFs

Use `pdftotext` to extract the actual rendered text from a PDF:

```bash
pdftotext input.pdf -          # prints all text to stdout
pdftotext -f 1 -l 1 input.pdf -  # first page only
```

**IMPORTANT:** `pdfinfo` only shows PDF metadata (often "untitled"/"anonymous"). To get the actual text content (titles, authors, data) rendered on pages, you MUST use `pdftotext`.

## Merging PDFs

Use `pdfunite` to merge multiple PDFs:

```bash
pdfunite a.pdf b.pdf merged.pdf
```

## Getting page count

```bash
pdfinfo input.pdf | grep Pages
```

## Common workflow: extract structured data from a PDF

1. Use `pdftotext file.pdf -` to get all text
2. Parse the text output to find the data you need
3. Write results to JSON using the write tool

## Common workflow: merge and extract info

1. Use `pdfunite` to merge files
2. Use `pdftotext` on each source file to extract text content (titles, authors, etc.)
3. Use `pdfinfo` only for page counts
4. Write combined info to JSON
