---
name: markdown-converter
description: Convert documents and files to Markdown using markitdown. Use when converting PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx, .xls), HTML, CSV, JSON, XML, images (with EXIF/OCR), audio (with transcription), ZIP archives, YouTube URLs, or EPubs to Markdown format for LLM processing or text analysis.
---

# Markdown Converter

Convert files to Markdown — pick the right approach based on file type.

## Decision: markitdown vs. direct processing

**Use `uvx markitdown`** for binary/opaque formats you can't read directly:
- PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx/.xls)
- Images (EXIF + OCR), Audio (transcription), EPub, ZIP archives
- HTML files (markitdown preserves structure accurately and is faster than manual parsing)

**Read the file directly** for text-based structured data:
- CSV, JSON, XML — you can read these natively; parse them yourself and format the markdown exactly as needed. Running markitdown on a CSV just gives you a raw table with no analysis capability. If the task requires computation, aggregation, or custom formatting, read the file and write code.

## markitdown usage

```bash
uvx markitdown input.pdf -o output.md     # convert and save
uvx markitdown input.docx > output.md     # or redirect stdout
uvx markitdown input.html -o output.md    # HTML conversion
```

Options: `-o FILE` (output path), `-x .ext` (hint extension for stdin), `-d` (Azure Document Intelligence for complex PDFs).

First run caches dependencies; subsequent runs are fast.

## Quality checklist

After conversion, verify the output preserves:
- Heading hierarchy (h1 → `#`, h2 → `##`, etc.)
- Inline formatting: **bold**, *italic*, `code`
- Code blocks (fenced with language tag when possible)
- Tables with proper `|---|` separator rows
- Lists (bullet and numbered)
- Links and images
