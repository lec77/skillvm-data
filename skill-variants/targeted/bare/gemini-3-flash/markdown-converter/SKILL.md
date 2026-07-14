---
name: markdown-converter
description: Convert documents and files to Markdown. Use for converting HTML, CSV, PDF, Word, Excel, PowerPoint, JSON, XML to Markdown format.
---

# Markdown Converter

## HTML → Markdown

Use `uvx markitdown` to convert HTML files:

```bash
uvx markitdown page.html -o output.md
```

Preserves headings, tables, lists, links, bold/italic/code formatting.

## CSV → Markdown Report

For CSV-to-Markdown reports, write and run a Python script. Use this template:

```python
import csv

with open('INPUT.csv') as f:
    reader = csv.DictReader(f)
    rows = [r for r in reader]

headers = list(rows[0].keys())  # Use EXACTLY as-is from CSV

md = "# Title\n\n"

# Summary section
md += "## Summary\n"
# Add computed stats like Product count, Price totals, etc.

# Data table - use raw CSV headers (e.g. product_id, price)
md += "| " + " | ".join(headers) + " |\n"
md += "| " + " | ".join(["---"] * len(headers)) + " |\n"
for r in rows:
    md += "| " + " | ".join(r[h] for h in headers) + " |\n"

# Additional sections as needed

with open('output.md', 'w') as f:
    f.write(md)
```

IMPORTANT: The table headers MUST be the raw CSV field names (like `product_id`, `price`). Do NOT rename them to "Product ID" or "Price".

## Other Formats

```bash
uvx markitdown input.pdf -o output.md
uvx markitdown input.docx -o output.md
uvx markitdown data.xlsx -o output.md
```
