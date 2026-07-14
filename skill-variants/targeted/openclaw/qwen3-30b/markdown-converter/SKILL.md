---
name: markdown-converter
description: Convert documents and files to Markdown. Use when converting HTML, CSV, or other structured files to well-formatted Markdown for documentation or analysis.
---

# Markdown Converter

## CSV/Spreadsheet → Markdown Report

**ALWAYS use a Python script for CSV processing. NEVER compute values mentally.**

### Workflow

1. Read the CSV to understand column names and data
2. Write a Python script file (e.g., `gen_report.py`) that reads the CSV, computes all values, and writes the Markdown output file
3. Run `python3 gen_report.py`
4. Verify the output file was created

**Do NOT use `python3 -c`** — quoting issues cause syntax errors. Write a `.py` file instead.

### Example gen_report.py

```python
import csv
from collections import defaultdict

rows = list(csv.DictReader(open("data.csv")))

total_count = len(rows)
categories = sorted(set(r["category"] for r in rows))
suppliers = sorted(set(r["supplier"] for r in rows))
# Total value = sum of Price * Stock for each item
total_value = sum(float(r["price"]) * int(r["stock"]) for r in rows)

cat_data = defaultdict(lambda: [0, 0])
for r in rows:
    cat_data[r["category"]][0] += 1
    cat_data[r["category"]][1] += int(r["stock"])

low_stock = [r for r in rows if int(r["stock"]) < 20]

lines = []
lines.append("# Report Title")
lines.append("")
lines.append("## Summary")
lines.append(f"- **Total Products**: {total_count}")
lines.append(f"- **Total Inventory Value (Price x Stock)**: ${total_value:,.2f}")
lines.append(f"- **Unique Categories**: {len(categories)}")
lines.append(f"- **Unique Suppliers**: {len(suppliers)}")
lines.append("")

# Use original CSV column names as table headers
lines.append("## Full Inventory")
lines.append("")
lines.append("| product_id | product_name | category | price | stock | supplier | last_restocked |")
lines.append("| --- | --- | --- | --- | --- | --- | --- |")
for r in rows:
    lines.append(f"| {r['product_id']} | {r['product_name']} | {r['category']} | {r['price']} | {r['stock']} | {r['supplier']} | {r['last_restocked']} |")

lines.append("")
lines.append("## Low Stock Alert")
lines.append("")
for r in low_stock:
    lines.append(f"- **{r['product_name']}**: {r['stock']}")

lines.append("")
lines.append("## Category Breakdown")
lines.append("")
lines.append("| Category | Item Count | Total Stock |")
lines.append("| --- | --- | --- |")
for cat in sorted(cat_data.keys()):
    count, stock = cat_data[cat]
    lines.append(f"| {cat} | {count} | {stock} |")

with open("output_report.md", "w") as f:
    f.write("\n".join(lines) + "\n")
print("Done")
```

**Key details:**
- Use original CSV column names as table headers (keep them lowercase as in the CSV)
- Include "Price" in the summary label (e.g., "Total Inventory Value (Price x Stock)")
- Let Python handle ALL arithmetic — never calculate manually
- Adapt column names and output filename to match the specific task requirements

## HTML → Markdown Conversion

**Do NOT use external tools like markitdown or uvx** — they may not be available.

Instead, read the HTML file and manually convert it to Markdown:

1. Read the HTML source with the read tool
2. Convert the HTML structure to Markdown:
   - `<h1>` → `# heading`
   - `<h2>` → `## heading`
   - `<h3>` → `### heading`
   - `<p>` → plain text with blank lines between paragraphs
   - `<strong>` or `<b>` → `**bold**`
   - `<em>` or `<i>` → `*italic*`
   - `<code>` (inline) → `` `code` ``
   - `<pre><code>` → fenced code block with triple backticks
   - `<ul><li>` → `- item`
   - `<ol><li>` → `1. item`
   - `<table>` → Markdown table with `|---|---|` separator row
   - `<a href="url">text</a>` → `[text](url)`
   - `<a href="mailto:x">` → `[x](mailto:x)`
3. Write the result to the output file

### Table conversion example

HTML:
```html
<table>
  <tr><th>Name</th><th>Type</th></tr>
  <tr><td>foo</td><td>string</td></tr>
</table>
```

Markdown:
```markdown
| Name | Type |
| --- | --- |
| foo | string |
```
