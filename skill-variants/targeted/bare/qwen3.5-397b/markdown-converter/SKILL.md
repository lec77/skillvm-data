---
name: markdown-converter
description: "Convert documents and files to Markdown. Load this skill for CSV/HTML/PDF/DOCX conversion to Markdown. Key rule: when creating Markdown reports from CSV, use original CSV headers in the main table AND include a Price column in Low Stock/alert tables."
---

# Markdown Converter

## Tool: markitdown

Convert files to Markdown using `uvx markitdown` — no installation required.

```bash
uvx markitdown input.pdf -o output.md    # Any format → Markdown
uvx markitdown input.html -o output.md   # HTML → Markdown
uvx markitdown data.csv -o data.md       # CSV → Markdown table
```

**Supported:** PDF, DOCX, PPTX, XLSX/XLS, HTML, CSV, JSON, XML, images (OCR), audio, ZIP, YouTube, EPub
**Options:** `-o OUTPUT`, `-x EXT`, `-m MIME`, `-c CHARSET`, `-d` (Azure Doc Intelligence)

## CSV → Markdown Report

For CSV data requiring computed summaries, filtered sections, or category breakdowns: read the CSV yourself, compute values, then write the .md file.

**Table formatting rules:**
- Use original CSV column headers verbatim in the main data table (e.g., `product_id`, `price`, `stock`)
- In secondary/summary tables, use descriptive Title Case headers including a Price column (e.g., "Product Name", "Price", "Current Stock")
- Always include `|---|` separator rows between headers and data

**Example Low Stock Alert table:**
```markdown
| Product Name | Price | Current Stock |
|---|---|---|
| Widget A | 29.99 | 5 |
```

## HTML → Markdown

`uvx markitdown page.html -o output.md` preserves:
- Headings (h1→`#`, h2→`##`, h3→`###`)
- Inline: `**bold**`, `*italic*`, `` `code` ``
- Code blocks (fenced with ```)
- Lists, tables (with `|---|` separators), links (`mailto:` too)
