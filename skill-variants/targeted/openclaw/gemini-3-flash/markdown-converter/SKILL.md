---
name: markdown-converter
description: Convert documents and files to Markdown using markitdown. Use when converting PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx, .xls), HTML, CSV, JSON, XML, images (with EXIF/OCR), audio (with transcription), ZIP archives, YouTube URLs, or EPubs to Markdown format for LLM processing or text analysis.
---

# Markdown Converter

Convert files to Markdown using `uvx markitdown` — no installation required.

## Basic Usage

```bash
uvx markitdown input.pdf -o output.md
uvx markitdown input.docx > output.md
```

## Supported Formats

- **Documents**: PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx, .xls)
- **Web/Data**: HTML, CSV, JSON, XML
- **Media**: Images (EXIF + OCR), Audio (EXIF + transcription)
- **Other**: ZIP (iterates contents), YouTube URLs, EPub

## Options

```bash
-o OUTPUT      # Output file
-x EXTENSION   # Hint file extension (for stdin)
```

## CSV/Data to Markdown Report

When creating a Markdown report from CSV data:

1. **Use a Python script** to compute all values (sums, aggregations). Never do arithmetic manually.
2. **Table headers**: Copy the exact CSV header row as the Markdown table header. Do NOT rename headers. If the CSV has `product_id,product_name,price` then the Markdown table must use `product_id | product_name | price` exactly.
3. **Summary text**: When describing calculated values, use human-readable labels. Example: "Total value is the sum of Price times Stock for each product" — this provides context for the reader.
4. **Include all rows and all columns** from the source data.
5. Run the script and verify.

## HTML to Markdown

```bash
uvx markitdown page.html -o output.md
```

Preserves headings, tables, lists, links, bold, italic, and code formatting.
