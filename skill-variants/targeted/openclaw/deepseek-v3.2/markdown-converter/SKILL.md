---
name: markdown-converter
description: Convert documents and files to Markdown using markitdown. Use when converting PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx, .xls), HTML, CSV, JSON, XML, images (with EXIF/OCR), audio (with transcription), ZIP archives, YouTube URLs, or EPubs to Markdown format for LLM processing or text analysis.
---

# Markdown Converter

Convert files to Markdown. Choose the right approach based on file type.

## When to use markitdown vs direct processing

**Use `uvx markitdown`** for binary/opaque formats:
- PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx/.xls)
- HTML files — markitdown handles structure well
- Images, Audio, EPub, ZIP

**Read the file directly and process it yourself** for text-based data:
- **CSV**: Read the CSV, parse it, compute any needed values (sums, counts, aggregations), and write the markdown yourself. markitdown just dumps a raw table — it cannot compute summaries, filter rows, or create multiple sections.
- **JSON, XML**: Parse and format as needed.

## markitdown usage

```bash
# Convert and save
uvx markitdown input.pdf -o output.md

# Redirect stdout
uvx markitdown input.html > output.md
```

Options: `-o FILE` (output path), `-x .ext` (hint extension for stdin).

First run caches dependencies; subsequent runs are fast.

## HTML conversion checklist

After converting HTML with markitdown, verify the output has:
- Correct heading levels: h1 → `#`, h2 → `##`, h3 → `###`
- Bold (`**text**`), italic (`*text*`), inline code (`` `code` ``)
- Code blocks preserved (fenced ``` or indented)
- Tables with header row, `|---|` separator, and data rows
- Bullet/numbered lists
- Links in `[text](url)` format

If markitdown output is missing formatting, post-process: read the original HTML and the markitdown output, then fix any missing elements.

## CSV to Markdown report pattern

When asked to create a report from CSV data, follow these steps:

1. **Read the CSV file** using cat or a script
2. **Parse the data** — split by lines and commas, handle the header row
3. **CRITICAL: Copy the CSV header row exactly as-is** for the main table headers. If the CSV first line is `product_id,product_name,category,price,stock,supplier`, then your markdown table header MUST be `| product_id | product_name | category | price | stock | supplier |`. Do NOT rename columns to "Product ID" or "Price" — keep the exact original names.
4. **Compute required values**: counts, sums (price × stock for each item), unique values, filters
5. **Write the markdown file** with all requested sections:
   - Title heading
   - Summary with computed statistics (e.g., "Total Inventory Value (Price × Stock): $X")
   - Full data table with ALL rows and original CSV column names
   - Filtered/grouped sections — use readable column names like "Product Name", "Price", "Stock" in these secondary tables
6. **Double-check arithmetic** — verify sums and counts are correct before writing

Important: Write the complete output file in one step. Include ALL data rows — do not truncate.
