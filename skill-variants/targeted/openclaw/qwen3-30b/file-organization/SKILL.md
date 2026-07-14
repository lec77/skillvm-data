---
name: file-organizer
description: Organize files into folders by type and find duplicate files using content hashing.
---

# File Organizer

Organize messy directories and find duplicate files.

## CRITICAL RULES

1. **Always work in the current working directory.** Never use `~`, `$HOME`, or absolute home paths. The target files are in subdirectories of your workspace (e.g., `downloads/`, `photos/`).
2. **You are on macOS with zsh.** Important constraints:
   - Use `md5` not `md5sum`
   - `mv -t` does NOT exist on macOS — use `mv <file> <dest>/` instead
   - zsh errors on unmatched globs even with `2>/dev/null` — do NOT use `mv dir/*.ext dest/`
3. **Act immediately.** Do not ask clarifying questions.

## Task: Organize Files by Type

When asked to organize files into folders by type, follow these exact steps:

**Step 1**: List all files:
```bash
find <dir> -maxdepth 1 -type f
```

**Step 2**: Create category directories inside the target directory:
```bash
mkdir -p <dir>/documents <dir>/images <dir>/code <dir>/media <dir>/archives
```

**Step 3**: Move each file individually based on its extension. Use one `mv` command per file. Example:
```bash
mv "<dir>/report.pdf" "<dir>/documents/"
mv "<dir>/photo.jpg" "<dir>/images/"
mv "<dir>/script.py" "<dir>/code/"
```

Or use a shell script to move files by extension safely:
```bash
cd <dir>
for f in *; do
  [ -f "$f" ] || continue
  case "${f##*.}" in
    pdf|docx|xlsx|pptx|txt|md|log|csv) mv "$f" documents/ ;;
    jpg|jpeg|png|gif|svg|heic|webp|bmp|tiff) mv "$f" images/ ;;
    py|ts|js|html|css|json|yaml|yml|sql|sh|go|rs|java|rb) mv "$f" code/ ;;
    mp4|mp3|mov|avi|mkv|wav|flac) mv "$f" media/ ;;
    zip|tar|gz|7z|rar|dmg) mv "$f" archives/ ;;
    exe|app|pkg) mv "$f" archives/ ;;
  esac
done
cd ..
```

**Extension to category mapping**:
- **documents**: pdf, docx, xlsx, pptx, txt, md, log, csv
- **images**: jpg, jpeg, png, gif, svg, heic, webp, bmp, tiff
- **code**: py, ts, js, html, css, json, yaml, yml, sql, sh, go, rs, java, rb
- **media**: mp4, mp3, mov, avi, mkv, wav, flac
- **archives**: zip, tar, gz, 7z, rar, dmg, exe, app, pkg

**Step 4**: Verify the result:
```bash
find <dir> -type f
```

## Task: Find Duplicate Files

When asked to find duplicates, use this exact approach:

```bash
find <dir> -type f -exec md5 {} \;
```

The output format is: `MD5 (<filepath>) = <hash>`

Read the hashes and group files with matching hashes. Report like:

```
Duplicate Group 1 (hash: abc123...):
  - photos/IMG_001.jpg
  - photos/sunset_copy.jpg

Duplicate Group 2 (hash: def456...):
  - photos/IMG_004.jpg
  - photos/family_edited.jpg
  - photos/family_copy2.jpg
```

**Important**: Run `md5` once on ALL files, then analyze the output yourself to find matching hashes. Do NOT use `uniq -d` or pipe tricks — they won't work with md5's output format. Do NOT use `md5sum` — it does not exist on macOS.

If the user says "do not delete", only report. Do not modify files.
