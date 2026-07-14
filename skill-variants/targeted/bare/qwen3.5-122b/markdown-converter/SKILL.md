---
name: markdown-converter
description: "MANDATORY for any file-to-Markdown task. Load this skill BEFORE starting work on CSV reports, HTML conversion, or any file-to-Markdown task. Key rules embedded in skill body: (1) For CSV data, use exact original lowercase column names from CSV as table headers (product_id not Product ID), (2) In summary text use capitalized labels like Total Products and Total Value by Price times Stock, (3) For HTML use uvx markitdown. YOU MUST LOAD THIS SKILL — it has critical formatting templates."
---

# Markdown Converter

**FOLLOW THESE RULES EXACTLY.**

## CSV, JSON, XML — MUST use a Python script

Do NOT use markitdown for data files. Do NOT compute values in your head. Write a Python script.

**Steps:**
1. Read the data file
2. Write a `process.py` script using Python's `csv`/`json` module
3. Run `python3 process.py`
4. Verify the output

**MANDATORY formatting for CSV reports:**

Table headers MUST be the exact original CSV column names (lowercase, with underscores):
```
| product_id | product_name | category | price | stock | supplier | last_restocked |
|------------|--------------|----------|-------|-------|----------|----------------|
```

Summary section MUST use capitalized human-readable labels:
```markdown
## Summary

| Metric | Value |
|--------|-------|
| Total Products | 10 |
| Total Inventory Value (Price × Stock) | $46,993.75 |
| Unique Categories | 4 |
| Unique Suppliers | 5 |
```

Note: the summary MUST mention "Price" capitalized (e.g., in "Price × Stock") AND the table headers MUST use lowercase `price`. Both forms are required.

Format currency with `$` and comma separators: `$46,993.75`

## HTML, PDF, Word, PowerPoint, Excel, images, audio, EPub, ZIP

Use `uvx markitdown`:
```bash
uvx markitdown input.html -o output.md
```
Preserves headings, tables, lists, bold, italic, code blocks, links (including `mailto:`).
