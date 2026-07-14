---
name: markdown-converter
description: "Convert files to Markdown format. Load this skill when creating reports from CSV/data files - it contains a Python script template for accurate calculations. For HTML conversion, use uvx markitdown."
---

# Markdown Converter

## HTML to Markdown

Run with `execute_command`:

```
uvx markitdown INPUT.html -o OUTPUT.md
```

## CSV to Markdown Report

CRITICAL: Write a Python script file and run it. NEVER calculate values in your head.

1. `read_file` the CSV to see columns
2. `write_file` a `convert.py` script
3. `execute_command` to run `python3 convert.py`

### convert.py template:

```python
import csv

rows = []
with open('INPUT.csv') as f:
    for row in csv.DictReader(f):
        rows.append(row)

with open('OUTPUT.md', 'w') as out:
    out.write('# Inventory Report\n\n')

    # Summary
    total_products = len(rows)
    total_value = sum(float(r['price']) * int(r['stock']) for r in rows)
    unique_categories = len(set(r['category'] for r in rows))
    unique_suppliers = len(set(r['supplier'] for r in rows))
    out.write('## Summary\n\n')
    out.write(f'- **Total Products**: {total_products}\n')
    out.write(f'- **Total Inventory Value**: ${total_value:,.2f}\n')
    out.write(f'- **Categories**: {unique_categories}\n')
    out.write(f'- **Suppliers**: {unique_suppliers}\n')
    avg_price = total_value / sum(int(r['stock']) for r in rows) if rows else 0
    out.write(f'- **Average Price**: ${sum(float(r["price"]) for r in rows)/len(rows):,.2f}\n\n')

    # Full table with original CSV column names as headers
    keys = list(rows[0].keys())
    out.write('| ' + ' | '.join(keys) + ' |\n')
    out.write('| ' + ' | '.join(['---'] * len(keys)) + ' |\n')
    for r in rows:
        out.write('| ' + ' | '.join(r[k] for k in keys) + ' |\n')
    out.write('\n')

    # Low stock: strictly less than 20
    out.write('## Low Stock Alert\n\n')
    for r in rows:
        if int(r['stock']) < 20:
            out.write(f"- **{r['product_name']}**: {r['stock']} units\n")
    out.write('\n')

    # Category breakdown
    out.write('## Category Breakdown\n\n')
    out.write('| Category | Item Count | Total Stock |\n')
    out.write('| --- | --- | --- |\n')
    for cat in sorted(set(r['category'] for r in rows)):
        cat_rows = [r for r in rows if r['category'] == cat]
        out.write(f'| {cat} | {len(cat_rows)} | {sum(int(r["stock"]) for r in cat_rows)} |\n')
```

Always write a .py file and execute it. Never compute values mentally.
