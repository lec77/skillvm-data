---
name: file-organizer
description: Organizes files into folders by type and finds duplicate files. Use for file cleanup, sorting, deduplication, or any file management task.
---

# File Organizer

Execute immediately. Do NOT ask for confirmation or approval. Do NOT present a plan and wait. Just do it.

## Task A: Organize files by type

If asked to organize/sort/clean up files:

### Step 1: List files
Run `ls` on the target directory.

### Step 2: Create directories and move files
Run ONE command that creates all directories and moves files. Use `mv` not `cp`.

Use exactly these lowercase directory names:

| Directory | Extensions |
|-----------|-----------|
| documents | pdf, docx, doc, txt, md, rtf, odt, xlsx, xls, csv, pptx, ppt |
| images | jpg, jpeg, png, gif, svg, heic, webp, bmp, tiff |
| code | py, ts, js, html, css, json, yaml, yml, toml, sql, sh |
| media | mp4, mov, avi, mp3, wav, flac, aac, mkv |
| archives | zip, tar, gz, rar, 7z, dmg, iso |
| other | exe, bin, app, log, cfg, ini, env, everything else |

Example:
```bash
cd downloads && \
mkdir -p documents images code media archives other && \
mv -f *.pdf *.docx *.doc *.txt *.md *.rtf *.xlsx *.xls *.csv *.pptx *.ppt documents/ 2>/dev/null; \
mv -f *.jpg *.jpeg *.png *.gif *.svg *.heic *.webp images/ 2>/dev/null; \
mv -f *.py *.ts *.js *.html *.css *.json *.yaml *.yml *.toml *.sql *.sh code/ 2>/dev/null; \
mv -f *.mp4 *.mov *.avi *.mp3 *.wav *.flac *.aac *.mkv media/ 2>/dev/null; \
mv -f *.zip *.tar *.gz *.rar *.7z *.dmg *.iso archives/ 2>/dev/null; \
mv -f *.exe *.bin *.app *.log *.cfg *.ini *.env other/ 2>/dev/null; \
echo "done"
```

### Step 3: Move remaining files
Check for leftover files in root. Move any remaining to `other/`.

### Step 4: Verify
Run `find <dir> -type f | sort` to confirm organization. Zero files should remain in root.

## Task B: Find duplicate files

If asked to find/detect/report duplicates:

### Step 1: Compute checksums
Run `md5sum` (or `md5 -r` on macOS) on ALL files in the target directory:
```bash
cd photos && md5sum * 2>/dev/null || md5 -r * 2>/dev/null
```

### Step 2: Group by checksum
Files with identical checksums are duplicates. Group them together.

### Step 3: Report ALL duplicate groups
For each group of duplicates, list EVERY filename. Example output format:

```
Duplicate group 1:
- IMG_001.jpg
- sunset_copy.jpg

Duplicate group 2:
- IMG_002.jpg
- mountain_backup.jpg
```

IMPORTANT: List ALL filenames in each group. Do not skip any files. Do not delete files unless asked.
