---
name: file-organizer
description: Organize files into folders by type and find duplicates by content comparison.
---

# File Organizer

## Organizing Files by Type

When asked to organize files in a directory:

1. List all files in the directory
2. Create subdirectories by category **inside the same directory**
3. Move every file into the appropriate subdirectory — leave NO files in the root
4. Preserve all files (do not delete any)

### Required directory names and file mappings

| Directory | Extensions |
|-----------|-----------|
| `documents` | .pdf, .docx, .doc, .txt, .md, .log |
| `images` | .jpg, .jpeg, .png, .heic, .gif, .svg, .webp |
| `code` | .py, .ts, .js, .html, .css, .json, .yaml, .yml, .sql |
| `media` | .mp4, .mov, .avi, .mp3, .wav, .flac |
| `archives` | .zip, .tar, .gz, .rar, .7z, .dmg |
| `spreadsheets` | .xlsx, .csv |
| `presentations` | .pptx, .key |
| `other` | .exe, and anything else |

### Execution steps

IMPORTANT: Do NOT use shell glob patterns like `*.pdf` — they fail in zsh when no match exists. Instead, use a `for` loop with `find` to move files safely.

```bash
# Step 1: Create all category directories
mkdir -p DIR/documents DIR/images DIR/code DIR/media DIR/archives DIR/spreadsheets DIR/presentations DIR/other

# Step 2: Move files by extension using find (safe for zsh)
find DIR -maxdepth 1 -type f \( -name "*.pdf" -o -name "*.docx" -o -name "*.doc" -o -name "*.txt" -o -name "*.md" -o -name "*.log" \) -exec mv {} DIR/documents/ \;
find DIR -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.heic" -o -name "*.gif" -o -name "*.svg" -o -name "*.webp" \) -exec mv {} DIR/images/ \;
find DIR -maxdepth 1 -type f \( -name "*.py" -o -name "*.ts" -o -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.json" -o -name "*.yaml" -o -name "*.yml" -o -name "*.sql" \) -exec mv {} DIR/code/ \;
find DIR -maxdepth 1 -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.avi" -o -name "*.mp3" -o -name "*.wav" -o -name "*.flac" \) -exec mv {} DIR/media/ \;
find DIR -maxdepth 1 -type f \( -name "*.zip" -o -name "*.tar" -o -name "*.gz" -o -name "*.rar" -o -name "*.7z" -o -name "*.dmg" \) -exec mv {} DIR/archives/ \;
find DIR -maxdepth 1 -type f \( -name "*.xlsx" -o -name "*.csv" \) -exec mv {} DIR/spreadsheets/ \;
find DIR -maxdepth 1 -type f \( -name "*.pptx" -o -name "*.key" \) -exec mv {} DIR/presentations/ \;

# Step 3: Move any remaining files to other/
find DIR -maxdepth 1 -type f -exec mv {} DIR/other/ \;

# Step 4: Remove empty directories (not category dirs)
find DIR -maxdepth 1 -empty -type d -delete
```

Replace `DIR` with the actual directory path.

## Finding Duplicates

When asked to find duplicate files:

1. Compute a hash (md5) for every file in the directory
2. Group files that share the same hash — these are exact duplicates
3. Report each duplicate group listing ALL filenames together

### Execution

```bash
find DIR -type f -exec md5sum {} + | sort | awk '{hash=$1; file=$2; a[hash]=a[hash] ? a[hash] ", " file : file; c[hash]++} END {for (h in c) if (c[h]>1) print a[h]}'
```

Report format — list every group clearly:
```
Duplicate group 1: IMG_001.jpg, sunset_copy.jpg
Duplicate group 2: IMG_002.jpg, mountain_backup.jpg
```

Always mention every filename in each duplicate group. Do not omit any file.
