---
name: file-organizer
description: Organize files into folders by type and find duplicates.
---

# File Organization

## Organizing files by type

When asked to organize files in a directory, create subdirectories and move every file into the correct one based on extension.

Use these directory names:

- `images` — .jpg .jpeg .png .heic .gif .svg .webp
- `documents` — .pdf .docx .doc .txt .md .pptx .xlsx
- `code` — .py .ts .js .html .css .json .yaml .yml .sql
- `media` — .mp4 .mov .avi .mp3 .wav .flac
- `archives` — .zip .tar .gz .dmg .rar
- `other` — everything else (.exe .log etc.)

IMPORTANT: On macOS/zsh, glob patterns like `*.jpeg` fail if no files match. You MUST use this approach:

```bash
cd <directory>
mkdir -p images documents code media archives other
for f in *; do
  [ -f "$f" ] || continue
  case "${f##*.}" in
    jpg|jpeg|png|heic|gif|svg|webp) mv "$f" images/ ;;
    pdf|docx|doc|txt|md|pptx|xlsx) mv "$f" documents/ ;;
    py|ts|js|html|css|json|yaml|yml|sql) mv "$f" code/ ;;
    mp4|mov|avi|mp3|wav|flac) mv "$f" media/ ;;
    zip|tar|gz|dmg|rar) mv "$f" archives/ ;;
    *) mv "$f" other/ ;;
  esac
done
```

Do NOT delete any files. Every file must be moved into a subdirectory.

## Finding duplicate files

Run this single command to find duplicates:

```bash
for f in <directory>/*; do echo "$(md5 -q "$f") $f"; done | sort | awk '{files[$1]=files[$1] ? files[$1] ", " $2 : $2; count[$1]++} END {for (h in count) if (count[h]>1) print "Duplicates:", files[h]}'
```

Report the output directly. Each line shows a group of duplicate files.
Do NOT delete any files. Do NOT use `md5sum` (not available on macOS), use `md5 -q`.
