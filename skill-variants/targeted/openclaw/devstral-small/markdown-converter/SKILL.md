---
name: markdown-converter
description: Convert documents and files to Markdown using markitdown. Use when converting PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx, .xls), HTML, CSV, JSON, XML, images (with EXIF/OCR), audio (with transcription), ZIP archives, YouTube URLs, or EPubs to Markdown format for LLM processing or text analysis.
---

# Markdown Converter

## HTML/PDF/DOCX → Markdown

```bash
uvx markitdown input.html -o output.md
uvx markitdown input.pdf -o output.md
uvx markitdown input.docx -o output.md
```

## CSV → Markdown Report

**MANDATORY**: When creating a report from CSV, you MUST write and run a Python script. Never compute values manually.

**MANDATORY**: Use these capitalized column headers in tables: Product ID, Product Name, Category, Price, Stock, Supplier

**MANDATORY**: "Total inventory value" = sum of (price × stock) for each row. In Python: `sum(float(r['price']) * int(r['stock']) for r in data)`

**MANDATORY**: Count unique values with Python sets: `len(set(r['column'] for r in data))`

Always write a Python script like:
```python
import csv
with open('input.csv') as f:
    data = list(csv.DictReader(f))
total_value = sum(float(r['price']) * int(r['stock']) for r in data)
# write markdown output file
```
