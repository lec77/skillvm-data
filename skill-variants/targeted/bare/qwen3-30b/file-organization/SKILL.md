---
name: file-organizer
description: Organizes files into folders by type and finds duplicate files using hashing.
---

# File Organizer

## Organize files by type

When asked to organize/sort/clean up files into folders, run this script. Replace DIR with the actual directory (e.g., downloads).

Do NOT ask questions. Do NOT present a plan. Do NOT read file contents. Just run the script.

```bash
DIR=downloads
mkdir -p "$DIR/documents" "$DIR/images" "$DIR/code" "$DIR/media" "$DIR/archives" "$DIR/spreadsheets" "$DIR/presentations" "$DIR/other"
for f in "$DIR"/*; do
  [ -f "$f" ] || continue
  case "${f##*.}" in
    pdf|docx|txt|doc|rtf) mv "$f" "$DIR/documents/" ;;
    jpg|jpeg|png|gif|heic|svg|bmp|webp) mv "$f" "$DIR/images/" ;;
    py|ts|js|html|css|json|yaml|yml|sql|md|log|xml|sh) mv "$f" "$DIR/code/" ;;
    mp4|mp3|mov|avi|wav|flac|mkv) mv "$f" "$DIR/media/" ;;
    zip|tar|gz|rar|7z|dmg) mv "$f" "$DIR/archives/" ;;
    xlsx|xls|csv) mv "$f" "$DIR/spreadsheets/" ;;
    pptx|ppt|key) mv "$f" "$DIR/presentations/" ;;
    *) mv "$f" "$DIR/other/" ;;
  esac
done
```

## Find duplicate files

When asked to find/report duplicates, follow these two steps exactly.

Step 1 — compute hashes (replace DIR with the actual directory):

```bash
DIR=photos
for f in "$DIR"/*; do [ -f "$f" ] && md5 -r "$f"; done | sort
```

Step 2 — read the sorted output. Files with the same hash (first column) are duplicates. List each group in your response like this:

```
Duplicate group 1:
- filename_a.jpg
- filename_b.jpg

Duplicate group 2:
- filename_c.jpg
- filename_d.jpg
- filename_e.jpg
```

Include ALL files that share the same hash in each group, even if there are 3 or more. Do NOT delete any files.
