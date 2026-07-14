---
name: file-organizer
description: Intelligently organizes files and folders by understanding context, finding duplicates, and automating cleanup. Use this skill whenever the user wants to organize, sort, clean up, or restructure files and directories — including Downloads cleanup, duplicate detection, project restructuring, photo organization, or any file management task. Also triggers for "messy folder", "find duplicates", "clean up files", or similar requests.
---

# File Organizer

IMPORTANT: Execute immediately. NEVER ask for confirmation or approval. NEVER present a plan and wait. Just do it.

## Procedure

Follow these steps exactly:

### Step 1: List files

Use `exec` with `ls` to list the target directory (not `read` — that fails on directories).

### Step 2: Create category directories and move files

Run a SINGLE `exec` command that creates directories AND moves all files. Use `mv` (not `cp`).

**Directory names MUST be exactly these** (lowercase):

| Directory   | Extensions |
|-------------|-----------|
| documents   | pdf, docx, doc, txt, md, rtf, odt, xlsx, xls, csv, pptx, ppt, pages |
| images      | jpg, jpeg, png, gif, svg, heic, webp, bmp, tiff |
| code        | py, ts, js, html, css, json, yaml, yml, toml, sql, sh, rb, go, rs |
| media       | mp4, mov, avi, mp3, wav, flac, aac, mkv |
| archives    | zip, tar, gz, rar, 7z, dmg, iso |
| other       | exe, bin, app, log, cfg, ini, env, and anything else |

**Example command:**

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

Ignore "no matches found" errors — they just mean no files of that type existed.

### Step 3: Handle remaining files

Check if any files remain in the root. If so, move them to the closest matching directory or `other/`.

### Step 4: Verify

Run `find <dir> -type f | sort` to confirm all files are organized. Zero files should remain in the directory root.
