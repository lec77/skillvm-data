---
name: markdown-converter
description: Convert documents and files to Markdown using markitdown. Use when converting PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx, .xls), HTML, CSV, JSON, XML, images (with EXIF/OCR), audio (with transcription), ZIP archives, YouTube URLs, or EPubs to Markdown format for LLM processing or text analysis.
---

# Markdown Converter

Convert files to Markdown using `uvx markitdown` — no installation required.

## Usage

```bash
uvx markitdown input.pdf -o output.md
uvx markitdown input.html -o output.md
uvx markitdown input.docx -o output.md
```

Supported: PDF, Word, PowerPoint, Excel, HTML, CSV, JSON, XML, images, audio, ZIP, YouTube, EPub.

Options: `-o OUTPUT` (output file), `-x EXT` (hint extension), `-d` (Azure Document Intelligence).

## CSV/Data Reports

When creating Markdown reports from CSV data, read the file and write the report directly using the write tool. Do NOT use bash or python scripts for calculations.

**Computing inventory value**: For each row, multiply the price column by the stock/quantity column. Then sum ALL of these row totals. Do not just sum prices — you must multiply price × quantity for every single row first.

**Counting unique values**: Count the number of distinct/different values. For example, if suppliers are: "A, A, B, C, B" then unique count = 3 (A, B, C). Be careful to count ALL distinct values.

**Column headers in tables**: Always capitalize column headers for readability. Use "Product ID", "Product Name", "Category", "Price", "Stock", "Supplier" etc. instead of raw CSV field names.

## HTML to Markdown

`uvx markitdown` converts HTML preserving headings, bold, italic, code, code blocks, lists, tables, and links.
