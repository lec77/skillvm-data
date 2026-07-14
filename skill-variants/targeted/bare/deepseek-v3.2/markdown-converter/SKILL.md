---
name: markdown-converter
description: Convert documents and files to Markdown using markitdown. Use when converting PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx, .xls), HTML, CSV, JSON, XML, images (with EXIF/OCR), audio (with transcription), ZIP archives, YouTube URLs, or EPubs to Markdown format for LLM processing or text analysis.
---

# Markdown Converter

Convert files to Markdown using `uvx markitdown` — no installation required.

## Quick Reference

```bash
uvx markitdown input.pdf -o output.md    # Convert any supported file
uvx markitdown input.html -o output.md   # HTML to Markdown
uvx markitdown input.docx > output.md    # Word to Markdown
```

## Supported Formats

PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx), HTML, CSV, JSON, XML, Images, Audio, ZIP, EPub

## CSV Data Processing

When creating Markdown reports from CSV data, write a Python script:
- Use the csv module to parse data and compute aggregations
- For Markdown tables, use **capitalized column headers** (e.g., "Product ID", "Product Name", "Price", "Stock") — not the raw CSV column names
- Include the original CSV column names (like `product_id`, `price`) somewhere in the document text, for example: "Source: product_id, product_name, category, price, stock, supplier, last_restocked"
- Format numbers with `$` for currency and commas for thousands

## Notes

- Output preserves document structure: headings, tables, lists, links
- For HTML conversion, `uvx markitdown` handles headings, tables, code blocks, formatting, and links automatically
