---
name: pdf
description: PDF document processing — extraction, creation, merging, splitting, and form filling. Use this skill whenever working with PDF files, including extracting text/tables, creating reports, manipulating pages, or filling forms. Especially important for PDF form filling, which requires bundled scripts.
---

# PDF Processing Guide

## Tool Selection

Pick the right tool for the job — this saves time and avoids false starts:

| Task | Best tool | Why |
|------|-----------|-----|
| Extract text | `pdfplumber` | Layout-aware, handles columns |
| Extract tables | `pdfplumber` with `page.extract_tables()` | Built-in table detection |
| Complex tables (poor line detection) | `pdfplumber` with custom `table_settings` | Tune `vertical_strategy`, `snap_tolerance`, `intersection_tolerance` |
| Create PDFs | `reportlab` (Platypus for structured docs, Canvas for precise layout) | Most capable Python PDF creator |
| Merge/split/rotate | `pypdf` | Lightweight, no external deps |
| Batch page ops from CLI | `qpdf` | Fast, handles complex page ranges |
| Fill PDF forms | See forms.md — **use the bundled scripts** | Custom scripts handle fillable + non-fillable forms reliably |
| Scanned/image PDFs | `pytesseract` + `pdf2image` | OCR fallback when text extraction returns empty |
| Render PDF to images | `pypdfium2` | Fast, Chromium-based renderer |

## Key Patterns

**Table extraction** — when `extract_tables()` returns messy results, tune the settings:
```python
table_settings = {
    "vertical_strategy": "lines",    # or "text", "explicit"
    "horizontal_strategy": "lines",
    "snap_tolerance": 3,
    "intersection_tolerance": 15
}
tables = page.extract_tables(table_settings)
```

**Text from specific region** — use bounding box extraction:
```python
bbox_text = page.within_bbox((left, top, right, bottom)).extract_text()
```

**PDF creation with tables** — use `reportlab.platypus.Table` with `TableStyle` for professional output. Key: set `GRID`, `BACKGROUND`, `FONTNAME` styles for headers.

**Merge from CLI** — `qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf` handles complex page ranges like `file1.pdf 1-3 file2.pdf 5-7`.

## Form Filling

This is where the skill adds the most value. PDF form filling has many pitfalls that the bundled scripts handle correctly.

**Read forms.md for the complete workflow.** The key steps:

1. Check if the PDF has fillable fields: `python scripts/check_fillable_fields.py <file.pdf>`
2. If fillable → extract fields → create values JSON → fill with `fill_fillable_fields.py`
3. If non-fillable → convert to images → identify field locations → create `fields.json` with bounding boxes → validate → fill with annotations

All scripts are in the `scripts/` directory relative to this file.

## Gotchas

- `pypdf.extract_text()` is lossy on complex layouts — prefer `pdfplumber` for extraction
- Scanned PDFs return empty text — check text length and fall back to OCR
- `reportlab` Canvas uses bottom-left origin (y=0 at bottom); coordinate math is inverted from typical screen coordinates
- When merging encrypted PDFs, decrypt first with `reader.decrypt(password)`
- For large PDFs (100+ pages), process in chunks to avoid memory issues
