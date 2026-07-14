---
name: markdown-converter
description: Convert documents and files to Markdown using markitdown. Use when converting PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx, .xls), HTML, CSV, JSON, XML, images (with EXIF/OCR), audio (with transcription), ZIP archives, YouTube URLs, or EPubs to Markdown format for LLM processing or text analysis.
---

# Markdown Converter

## CRITICAL: How to write Python scripts

NEVER run Python code inline with `python3 -c "..."`. The shell will break on `$` signs in f-strings.

Instead, ALWAYS:
1. Use the **write** tool to save the script as `script.py`
2. Use **bash** to run: `python3 script.py`

## Choose approach by file type

**For HTML, PDF, Word, PowerPoint, Excel, images, audio, EPub, ZIP:**

```bash
uvx markitdown input.html -o output.md
uvx markitdown input.pdf -o output.md
```

**For CSV, JSON, XML — DO NOT use markitdown.** markitdown on CSV only gives a raw table. If you need computation, aggregation, filtering, or custom sections, read the file and write a Python script to process it.

Steps:
1. Read the CSV file to understand its structure
2. Use the **write** tool to create `script.py` that reads the CSV, computes all values, and writes the markdown output
3. Run `python3 script.py` with **bash**

## After conversion: verify output

Check that output has:
- Heading hierarchy: `#`, `##`, `###`
- Tables with `| header |` and `|---|` separator rows
- Inline formatting: **bold**, *italic*, `code`
- Code blocks, bullet lists, links
