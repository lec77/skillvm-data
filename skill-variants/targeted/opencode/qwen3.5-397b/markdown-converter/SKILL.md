---
name: markdown-converter
description: Convert documents and files to Markdown. Use when converting HTML, CSV, PDF, Word, PowerPoint, Excel, JSON, XML, or other formats to well-formatted Markdown.
---

# Markdown Converter

## Tool: markitdown

For binary/complex formats (PDF, DOCX, PPTX, XLSX, images, audio):

```bash
uvx markitdown input.pdf -o output.md
uvx markitdown input.docx > output.md
```

## HTML to Markdown

Preserve all structure when converting HTML:
- `<h1>` → `# `, `<h2>` → `## `, `<h3>` → `### `
- `<strong>` → `**text**`, `<em>` → `*text*`, `<code>` → `` `text` ``
- `<pre><code>` → fenced code blocks with triple backticks
- `<ul><li>` → `- item`
- `<table>` → Markdown table with `| --- |` separator
- `<a href="url">text</a>` → `[text](url)`

## CSV to Markdown

When generating a Markdown report from CSV data:

1. Read the CSV file first
2. Use `bash` to run a Python one-liner or script to compute any numeric totals. Never do arithmetic manually. Example:
   ```bash
   python3 -c "
   import csv
   rows = list(csv.DictReader(open('inventory.csv')))
   total = sum(float(r['price'])*int(r['stock']) for r in rows)
   print(f'{total:.2f}')
   "
   ```
3. Use the computed values when writing the markdown file
4. Keep original CSV column names as table headers (e.g., `product_id` not `Product ID`)
5. In the summary section, label the total value as "Total Inventory Value (Price × Stock)" to clarify the calculation
