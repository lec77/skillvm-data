---
name: file-organizer
description: Organize files into folders by type and find duplicate files by content hash.
---

# File Organizer

IMPORTANT: Execute immediately. NEVER ask for confirmation. NEVER present a plan and wait. Just do it.

IMPORTANT: Always output your results as plain text in your response. Do NOT use messaging tools or any tool to send reports. Just write the report directly as your response text.

## Task 1: Organize Files by Type

When asked to organize files in a directory:

1. List all files: `ls -1 TARGET_DIR/`
2. Create category subdirectories inside TARGET_DIR:
   - `documents` — pdf, docx, doc, txt, md, rtf, xlsx, xls, csv, pptx, ppt, key
   - `images` — jpg, jpeg, png, gif, svg, heic, webp, bmp, tiff, ico
   - `code` — py, js, ts, jsx, tsx, html, css, json, yaml, yml, xml, sql, sh, rb, go, rs, c, cpp, h, java
   - `media` — mp4, mov, avi, mkv, mp3, wav, flac, aac, ogg, m4a
   - `archives` — zip, tar, gz, bz2, xz, 7z, rar, dmg, iso, pkg
   - `other` — exe, log, and anything else
3. Create dirs and move files:

```bash
cd TARGET_DIR
mkdir -p documents images code media archives other
for f in *.pdf *.docx *.doc *.txt *.md *.rtf *.xlsx *.xls *.csv *.pptx *.ppt; do [ -f "$f" ] && mv "$f" documents/; done
for f in *.jpg *.jpeg *.png *.gif *.svg *.heic *.webp *.bmp; do [ -f "$f" ] && mv "$f" images/; done
for f in *.py *.js *.ts *.jsx *.tsx *.html *.css *.json *.yaml *.yml *.xml *.sql *.sh; do [ -f "$f" ] && mv "$f" code/; done
for f in *.mp4 *.mov *.avi *.mkv *.mp3 *.wav *.flac *.aac; do [ -f "$f" ] && mv "$f" media/; done
for f in *.zip *.tar *.gz *.7z *.rar *.dmg *.iso *.pkg; do [ -f "$f" ] && mv "$f" archives/; done
for f in *.exe *.log; do [ -f "$f" ] && mv "$f" other/; done
```

4. Remove any empty category directories: `rmdir documents images code media archives other 2>/dev/null`

## Task 2: Find Duplicate Files

When asked to find duplicates in a directory:

1. Compute MD5 hash of every file using `md5sum` (works on macOS and Linux):

```bash
find TARGET_DIR -type f -exec md5sum {} \;
```

If `md5sum` is not available, use macOS `md5`:

```bash
find TARGET_DIR -type f -exec md5 -r {} \;
```

The `-r` flag outputs in `hash  filename` format (same as md5sum).

2. Group files by hash — files with the same hash are duplicates.

3. Report each duplicate group. You MUST mention every filename in each group together. Example output format:

```
## Duplicate Group 1
- file_a.jpg
- file_b.jpg
(same content, MD5: abc123)

## Duplicate Group 2
- file_c.jpg
- file_d.jpg
- file_e.jpg
(same content, MD5: def456)
```

IMPORTANT: List ALL files that share the same hash together in one group. Do NOT miss any files. Every duplicate must be reported.
