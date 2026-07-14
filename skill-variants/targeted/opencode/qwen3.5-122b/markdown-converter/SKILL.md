---
name: markdown-converter
description: "MANDATORY for any file-to-Markdown conversion. YOU MUST LOAD THIS SKILL before converting CSV, HTML, or any file to Markdown. Critical rules: (1) CSV/JSON/XML → write a Python script, never use markitdown, use exact lowercase CSV column names as table headers, (2) HTML/PDF/DOCX → use uvx markitdown. Contains required formatting templates."
---

# Markdown Converter

## CSV, JSON, XML → Write a Python Script

**NEVER use markitdown for data files.** Write a Python script to process the data.

### Workflow

1. Write a Python script (e.g., `convert.py`) using the `csv` standard library module
2. Run it: `python3 convert.py`
3. Verify output file was created

### CSV Report Formatting Rules

**Table headers** = exact original CSV column names (lowercase, underscores):

```markdown
| product_id | product_name | category | price | stock | supplier | last_restocked |
|------------|--------------|----------|-------|-------|----------|----------------|
```

**Summary section** uses capitalized labels. The inventory value label MUST include "Price × Stock":

```markdown
## Summary

- **Total Products**: 10
- **Total Inventory Value (Price × Stock)**: $46,993.75
- **Unique Categories**: 4
- **Unique Suppliers**: 5
```

Compute `Total Inventory Value` as `sum(price * stock)` for all rows. Format currency: `$XX,XXX.XX`.

IMPORTANT: The summary label must literally say "Price" (capitalized) — e.g., "Total Inventory Value (Price × Stock)".

**Low stock** = items where `stock < 20`. List product name and stock count.

**Category breakdown** = group by category, show item count and total stock per category.

### Example Python Script Pattern

```python
import csv

with open('input.csv') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# Compute stats
total_value = sum(float(r['price']) * int(r['stock']) for r in rows)
categories = {}
for r in rows:
    cat = r['category']
    categories.setdefault(cat, {'count': 0, 'stock': 0})
    categories[cat]['count'] += 1
    categories[cat]['stock'] += int(r['stock'])

# Write markdown
with open('output.md', 'w') as out:
    out.write('# Title\n\n')
    out.write('## Summary\n\n')
    out.write(f'- **Total Products**: {len(rows)}\n')
    out.write(f'- **Total Inventory Value (Price × Stock)**: ${total_value:,.2f}\n')
    # ... continue writing sections
```

## HTML, PDF, DOCX, PPTX, XLSX, Images, Audio, EPub, ZIP → Use markitdown

```bash
uvx markitdown input.html -o output.md
```

Preserves: headings (h1-h3), bold, italic, inline code, code blocks, lists, tables, links (including `mailto:`).

For HTML specifically, `uvx markitdown` handles all formatting correctly — just run the command and save the output.
