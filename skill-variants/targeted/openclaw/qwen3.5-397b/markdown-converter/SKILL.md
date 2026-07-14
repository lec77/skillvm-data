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

Supported: PDF, DOCX, PPTX, XLSX, HTML, CSV, JSON, XML, images, audio, ZIP, YouTube, EPub.

## Key Options

```bash
-o OUTPUT      # Output file
-x EXTENSION   # Hint file extension (for stdin)
```

## Converting HTML to Markdown

Use `uvx markitdown page.html -o output.md` or convert manually. Preserve:
- Headings: `<h1>` → `# `, `<h2>` → `## `, `<h3>` → `### `
- Formatting: `<strong>` → `**bold**`, `<em>` → `*italic*`, `<code>` → `` `code` ``
- Code blocks: `<pre><code>` → fenced ` ``` ` blocks
- Lists: `<ul><li>` → `- item`
- Tables: `<table>` → `| Header |` with `|---|` separator
- Links: `<a href="url">text</a>` → `[text](url)`

## Creating Reports from Data Files

When creating Markdown reports from CSV/data:

1. Include ALL rows from the source — never skip or summarize data
2. Format column headers as readable Title Case (e.g. `product_id` → `Product ID`, `price` → `Price`, `last_restocked` → `Last Restocked`)
3. Include all numeric values exactly as they appear in the source
4. **For computed values (sums, totals): use a shell command or script to compute them accurately.** For example, use `awk` or `python3 -c` to calculate totals rather than doing mental arithmetic. Example:
   ```bash
   # Calculate total inventory value (price × stock for each row, then sum)
   awk -F',' 'NR>1 {sum += $4 * $5} END {printf "%.2f", sum}' data.csv
   ```
5. Double-check that all product IDs, names, and values appear in the output

## Notes

- Output preserves document structure: headings, tables, lists, links
- First `uvx markitdown` run caches dependencies; subsequent runs are faster
