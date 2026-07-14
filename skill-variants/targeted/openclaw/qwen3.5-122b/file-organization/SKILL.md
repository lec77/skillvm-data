---
name: file-organizer
description: Organize files into folders by type and find duplicate files using content hashing.
---

# File Organizer

Organize messy directories and find duplicate files.

## CRITICAL RULES

1. **Always work in the current working directory.** Never use `~`, `$HOME`, or absolute home paths. The target files are in subdirectories of your workspace (e.g., `downloads/`, `photos/`).
2. **You are on Linux with bash.** Use `md5sum` (not `md5`). Use standard GNU coreutils.
3. **Act immediately.** Do not ask clarifying questions. Do not propose a plan and wait for approval. Just do the work.
4. **Move ALL files.** Leave zero files in the root of the target directory. Every file must end up in a category subdirectory.

## Task: Organize Files by Type

When asked to organize files into folders by type:

**Step 1**: List all files in the target directory:
```bash
ls -1 <dir>
```

**Step 2**: Create category directories inside the target directory:
```bash
mkdir -p <dir>/documents <dir>/images <dir>/code <dir>/media <dir>/archives <dir>/other
```

**Step 3**: Move files by extension using a for-loop:
```bash
cd <dir>
for f in *; do
  [ -f "$f" ] || continue
  ext="${f##*.}"
  case "$ext" in
    pdf|docx|doc|xlsx|pptx|txt|md|log|csv) mv "$f" documents/ ;;
    jpg|jpeg|png|gif|svg|heic|webp|bmp|tiff) mv "$f" images/ ;;
    py|ts|js|html|css|json|yaml|yml|sql|sh|go|rs|java|rb) mv "$f" code/ ;;
    mp4|mp3|mov|avi|mkv|wav|flac) mv "$f" media/ ;;
    zip|tar|gz|7z|rar|dmg) mv "$f" archives/ ;;
    *) mv "$f" other/ ;;
  esac
done
cd ..
```

**Extension to category mapping**:
- **documents**: pdf, docx, doc, xlsx, pptx, txt, md, log, csv
- **images**: jpg, jpeg, png, gif, svg, heic, webp, bmp, tiff
- **code**: py, ts, js, html, css, json, yaml, yml, sql, sh, go, rs, java, rb
- **media**: mp4, mp3, mov, avi, mkv, wav, flac
- **archives**: zip, tar, gz, 7z, rar, dmg, exe, app, pkg

**Step 4**: Verify no files remain in root:
```bash
find <dir> -maxdepth 1 -type f
```

If any files remain, move them to `other/`.

## Task: Find Duplicate Files

When asked to find duplicates:

**Step 1**: Compute MD5 hash of every file:
```bash
md5sum <dir>/*
```

**Step 2**: Read the output. Lines look like: `<hash>  <filepath>`

**Step 3**: Group files that share the same hash. These are exact duplicates.

**Step 4**: Report each group listing ALL filenames. Example format:
```
Duplicate Group 1:
  - photos/IMG_001.jpg
  - photos/sunset_copy.jpg

Duplicate Group 2:
  - photos/IMG_004.jpg
  - photos/family_edited.jpg
  - photos/family_copy2.jpg
```

**Important**: Mention every filename in each duplicate group in your text response. If the user says "do not delete", only report — do not modify or remove any files.
