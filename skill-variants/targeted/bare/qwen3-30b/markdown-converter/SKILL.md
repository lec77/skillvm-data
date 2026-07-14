---
name: markdown-converter
description: Convert files to Markdown, create reports from data files, or transform documents. Use when working with HTML, PDF, Word, PowerPoint, Excel, CSV, JSON, XML, images, audio, ZIP, EPub — any file-to-markdown task including data reports and summaries.
---

# Markdown Converter

IMPORTANT: Load this skill BEFORE starting any file-to-markdown conversion task.

## HTML, PDF, Word, PowerPoint, Excel, images, audio, EPub, ZIP

Use `uvx markitdown` — one command does everything:
```bash
uvx markitdown input.html -o output.md
uvx markitdown input.pdf -o output.md
uvx markitdown input.docx -o output.md
```
This preserves headings, tables, lists, links, bold, italic, code blocks.

## CSV, JSON, XML — MUST use a Python script file

Do NOT use markitdown for CSV/JSON/XML. Do NOT use `python3 -c "..."` (quoting always breaks). Do NOT compute values in your head (you will get arithmetic wrong).

**The ONLY correct approach:**
1. Read the data file to understand its columns
2. Use `write_file` to save a `process.py` script that:
   - Opens and parses the data with Python's `csv` module
   - Computes ALL numbers with code (sums, counts, unique values)
   - Generates the complete markdown output string
   - Writes it to the target .md file
3. Run `python3 process.py` via `execute_command`
4. Verify the output file with `read_file`
