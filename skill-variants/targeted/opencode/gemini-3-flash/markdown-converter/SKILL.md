---
name: markdown-converter
description: Convert documents and files to Markdown. Use for converting HTML, CSV, PDF, Word, Excel, PowerPoint, JSON, XML to Markdown format.
---

# Markdown Converter

## HTML → Markdown

Use `uvx markitdown` to convert HTML files to Markdown:

```bash
uvx markitdown page.html -o output.md
```

This preserves: headings (`#`, `##`, `###`), **bold**, *italic*, `code`, code blocks, tables with `|---|` separators, bullet lists, and `[text](url)` links.

## CSV → Markdown Report

For CSV files that need analysis/reporting, read the CSV and write a Python script to generate the Markdown report.

Steps:
1. Read the CSV file to understand columns and data
2. Write a Python script that:
   - Parses the CSV with `csv.DictReader`
   - Computes any required summary statistics (counts, totals, aggregations)
   - Builds a complete Markdown table using ALL CSV columns with the original CSV header names
   - Generates additional sections as requested (alerts, breakdowns, etc.)
   - Writes the result to the output `.md` file
3. Run the script with `python3 script.py`

Example template:

```python
import csv
from collections import defaultdict

with open('data.csv') as f:
    reader = csv.DictReader(f)
    headers: list[str] = list(reader.fieldnames or [])
    rows: list[dict[str, str]] = list(reader)

md = "# Report Title\n\n"

# Summary section — IMPORTANT: use exactly "Price" (capitalized) when describing monetary values
md += "## Summary\n\n"
md += f"- **Total Products**: {len(rows)}\n"
total_val = sum(float(r['price']) * int(r['stock']) for r in rows)
md += f"- **Total Inventory Value** (Price × Stock): ${total_val:,.2f}\n"

# Full data table — keep raw CSV column names as headers (product_id, price, etc.)
md += "\n## Data Table\n\n"
md += "| " + " | ".join(headers) + " |\n"
md += "| " + " | ".join(["---"] * len(headers)) + " |\n"
for r in rows:
    md += "| " + " | ".join(r.get(h, '') for h in headers) + " |\n"

# Filtered sections (e.g., low stock: int(r['stock']) < 20)
# Group-by sections (use defaultdict to aggregate by category)

with open('output.md', 'w') as f:
    f.write(md)
```

## Other Formats

```bash
uvx markitdown input.pdf -o output.md
uvx markitdown input.docx -o output.md
uvx markitdown data.xlsx -o output.md
```

Options: `-o FILE` output path, `-x .ext` hint extension for stdin, `-d` Azure Document Intelligence for complex PDFs.
