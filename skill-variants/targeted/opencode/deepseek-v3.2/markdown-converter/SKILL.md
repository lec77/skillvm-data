---
name: markdown-converter
description: Convert documents and files to Markdown using markitdown. Use when converting PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx, .xls), HTML, CSV, JSON, XML, images (with EXIF/OCR), audio (with transcription), ZIP archives, YouTube URLs, or EPubs to Markdown format for LLM processing or text analysis.
---

# Markdown Converter

Convert files to Markdown using `uvx markitdown` — no installation required.

## Basic Usage

```bash
# Convert to stdout
uvx markitdown input.pdf

# Save to file
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
-m MIME_TYPE   # Hint MIME type
-c CHARSET     # Hint charset (e.g., UTF-8)
-d             # Use Azure Document Intelligence
-e ENDPOINT    # Document Intelligence endpoint
```

## HTML to Markdown

For HTML files, `uvx markitdown` preserves:
- Heading hierarchy (h1→`#`, h2→`##`, h3→`###`)
- Inline formatting: `**bold**`, `*italic*`, `` `code` ``
- Code blocks (fenced with ```)
- Bullet lists, tables with `|---|` separators
- Links as `[text](url)` including `mailto:` links

## CSV / Data to Markdown Reports

When converting CSV data to a Markdown report with analysis:
- **ALWAYS use a Python script** to read CSV, compute all statistics, and generate the Markdown file — never compute totals or aggregates manually, as mental math errors are common
- The Python script should: parse with `csv.DictReader`, compute all sums/counts/filters programmatically, then write the complete Markdown to the output file
- Use the exact CSV column headers as table headers (e.g., `product_id`, `product_name`, `price`, `stock`)
- In the summary/prose sections, use capitalized labels alongside (e.g., "Total Value (Price × Stock): $X") so both original field names and readable names appear in the output
- For tables, use Markdown pipe syntax with separator row `|---|---|`

## Notes

- Output preserves document structure: headings, tables, lists, links
- First run of markitdown caches dependencies; subsequent runs are faster
