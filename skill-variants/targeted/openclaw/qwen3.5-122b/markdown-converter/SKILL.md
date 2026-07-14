---
name: markdown-converter
description: Convert documents and files to Markdown using markitdown. Use when converting PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx, .xls), HTML, CSV, JSON, XML, images (with EXIF/OCR), audio (with transcription), ZIP archives, YouTube URLs, or EPubs to Markdown format for LLM processing or text analysis.
---

# Markdown Converter

Convert files to Markdown using `uvx markitdown` — no installation required.

## Quick Reference

```bash
# Convert any supported file to markdown
uvx markitdown input.html -o output.md
uvx markitdown input.pdf -o output.md
uvx markitdown input.docx -o output.md
```

## Supported Formats

PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx/.xls), HTML, CSV, JSON, XML, Images, Audio, ZIP, YouTube URLs, EPub.

## CRITICAL RULES

### Rule 1: For HTML/document conversion, use `uvx markitdown` directly

```bash
uvx markitdown page.html -o output.md
```

This preserves headings, tables, lists, code blocks, links, bold, italic, and code spans automatically.

### Rule 2: For CSV data analysis tasks (reports with summaries, calculations, filtered sections), write a Python script

**NEVER use `python3 -c` with multiline code — it causes syntax errors. Always write a .py file first, then run it.**

Steps:
1. Use the write/file tool to create a Python script (e.g., `generate_report.py`)
2. Run it with `python3 generate_report.py`

### Complete CSV Report Example

When asked to create a report from CSV data with summaries, tables, and analysis sections, use this pattern:

```python
import csv
from collections import defaultdict

# Read CSV
rows = []
with open('inventory.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append(row)

lines = []
lines.append('# Inventory Report')
lines.append('')

# Summary section
lines.append('## Summary')
lines.append('')
lines.append(f'- **Total products**: {len(rows)}')
total_value = sum(float(row['price']) * int(row['stock']) for row in rows)
lines.append(f'- **Total inventory value**: ${total_value:,.2f}')
categories = set(row['category'] for row in rows)
lines.append(f'- **Unique categories**: {len(categories)}')
suppliers = set(row['supplier'] for row in rows)
lines.append(f'- **Unique suppliers**: {len(suppliers)}')
lines.append('')

# Product table with Price and stock data
lines.append('## Product Inventory')
lines.append('')
lines.append('Price and stock data for all products:')
lines.append('')
if rows:
    headers = list(rows[0].keys())
    lines.append('| ' + ' | '.join(headers) + ' |')
    lines.append('| ' + ' | '.join(['---'] * len(headers)) + ' |')
    for row in rows:
        lines.append('| ' + ' | '.join(row[h] for h in headers) + ' |')
lines.append('')

# Low stock alerts (stock < 20)
low_stock = [r for r in rows if int(r['stock']) < 20]
lines.append('## Low Stock Alert')
lines.append('')
for item in low_stock:
    lines.append(f"- {item['product_name']}: {item['stock']} units")
lines.append('')

# Category breakdown
groups = defaultdict(lambda: {'count': 0, 'total': 0})
for row in rows:
    cat = row['category']
    groups[cat]['count'] += 1
    groups[cat]['total'] += int(row['stock'])

lines.append('## Category Breakdown')
lines.append('')
lines.append('| Category | Items | Total Stock |')
lines.append('| --- | --- | --- |')
for cat, info in sorted(groups.items()):
    lines.append(f"| {cat} | {info['count']} | {info['total']} |")

with open('inventory_report.md', 'w') as f:
    f.write('\n'.join(lines) + '\n')
print('Done')
```

## Options

```
-o OUTPUT      # Output file path
-x EXTENSION   # Hint file extension (for stdin)
-m MIME_TYPE   # Hint MIME type
-c CHARSET     # Hint charset
```
