---
name: file-organizer
description: Organizes files into folders by type and finds duplicate files.
---

# File Organizer

CRITICAL: Execute immediately. NEVER ask for confirmation. NEVER present a plan and wait. Just do the work.

## Organizing Files by Type

When asked to organize files into folders:

### Step 1: List files

Run `ls` on the target directory.

### Step 2: Create directories and move files

Run a SINGLE `bash -c` command (to avoid zsh glob errors) that creates directories AND moves files:

```bash
bash -c '
cd TARGET_DIR
mkdir -p documents images code media archives other
for f in *; do
  [ -f "$f" ] || continue
  ext="${f##*.}"
  ext=$(echo "$ext" | tr "A-Z" "a-z")
  case "$ext" in
    pdf|docx|doc|txt|rtf|odt|xlsx|xls|csv|pptx|ppt|pages) mv "$f" documents/ ;;
    jpg|jpeg|png|gif|svg|heic|webp|bmp|tiff) mv "$f" images/ ;;
    py|ts|js|html|css|json|yaml|yml|toml|sql|sh|rb|go|rs|md) mv "$f" code/ ;;
    mp4|mov|avi|mp3|wav|flac|aac|mkv) mv "$f" media/ ;;
    zip|tar|gz|rar|7z|dmg|iso) mv "$f" archives/ ;;
    *) mv "$f" other/ ;;
  esac
done
'
```

Replace TARGET_DIR with the actual path.

### Step 3: Verify

Run `find TARGET_DIR -type f | sort` to confirm. No files should remain in the directory root.

## Finding Duplicate Files

When asked to find duplicates:

### Step 1: Hash all files

On macOS, use `md5 -r`:

```bash
find TARGET_DIR -type f -exec md5 -r {} \;
```

### Step 2: Group and report duplicates

Files with identical MD5 hashes are duplicates. Print ALL duplicate groups with ALL filenames in each group:

```
Duplicate group 1:
- file_a.jpg
- file_b.jpg

Duplicate group 2:
- file_c.jpg
- file_d.jpg
- file_e.jpg
```

Report every filename. Do NOT delete any files unless explicitly asked.
